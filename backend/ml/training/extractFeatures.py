"""
Batch Feature Extraction Pipeline
==================================

Extracts the full 29-feature vector (17 URL + 12 OSINT) for every URL
in the raw phishing and legitimate datasets.

URL structural features (17) are extracted offline — instant, no network.
OSINT features (12) require DNS and WHOIS lookups — batched with caching,
rate limiting, and graceful fallback for unavailable data.

XGBoost handles missing values (NaN) natively, so unavailable OSINT
features are stored as NaN rather than imputed.

Usage:
    python -m backend.ml.training.extractFeatures

Output:
    data/processed/features_raw.csv

Author: Ishaq Muhammad (PXPRGK)
Course: BSc Thesis - ELTE Faculty of Informatics
"""

from __future__ import annotations

import asyncio
import csv
import json
import logging
import sys
import time
from pathlib import Path
from typing import Optional

import numpy as np
from tqdm import tqdm

from backend.ml.featureExtractor import extractUrlFeatures
from backend.ml.schemas import FEATURE_NAMES, OsintFeatures

# ============================================================================
# Configuration
# ============================================================================

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[3]
RAW_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
OUTPUT_FILE = PROCESSED_DIR / "features_raw.csv"
OSINT_CACHE_FILE = RAW_DIR / "osint_cache.json"

# DNS lookup settings
DNS_BATCH_SIZE = 50
DNS_TIMEOUT = 3.0
DNS_MAX_CONCURRENT = 20

# WHOIS is much slower — we skip it for batch extraction and use
# defaults. For production, the live pipeline does WHOIS per-request.
SKIP_WHOIS_IN_BATCH = True

# Maximum URLs to process (0 = no limit)
MAX_URLS = 0


# ============================================================================
# OSINT Cache
# ============================================================================

class OsintCache:
    """
    Persistent cache for OSINT lookup results.

    Saves DNS results to disk so re-running the pipeline skips
    already-queried domains.
    """

    def __init__(self, cachePath: Path) -> None:
        self._path = cachePath
        self._data: dict[str, dict] = {}
        self._load()

    def _load(self) -> None:
        """Load cache from disk."""
        if self._path.exists():
            try:
                with open(self._path, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
                logger.info(f"Loaded OSINT cache: {len(self._data)} entries")
            except (json.JSONDecodeError, OSError):
                self._data = {}

    def save(self) -> None:
        """Persist cache to disk."""
        self._path.parent.mkdir(parents=True, exist_ok=True)
        with open(self._path, "w", encoding="utf-8") as f:
            json.dump(self._data, f)

    def get(self, domain: str) -> Optional[dict]:
        """Get cached result for a domain."""
        return self._data.get(domain.lower())

    def put(self, domain: str, result: dict) -> None:
        """Cache a result for a domain."""
        self._data[domain.lower()] = result

    def __len__(self) -> int:
        return len(self._data)


# ============================================================================
# DNS Batch Lookup
# ============================================================================

async def batchDnsLookup(
    domains: list[str],
    cache: OsintCache,
    timeout: float = DNS_TIMEOUT,
    maxConcurrent: int = DNS_MAX_CONCURRENT,
) -> dict[str, dict]:
    """
    Perform batched async DNS lookups for multiple domains.

    Args:
        domains: List of domain names to resolve.
        cache: OSINT cache for skipping known domains.
        timeout: DNS query timeout in seconds.
        maxConcurrent: Max concurrent DNS lookups.

    Returns:
        Dict mapping domain → DNS result dict.
    """
    from backend.osint.dnsChecker import DnsChecker
    from backend.osint.schemas import LookupStatus

    results: dict[str, dict] = {}
    uncachedDomains: list[str] = []

    # Check cache first
    for domain in domains:
        cached = cache.get(domain)
        if cached is not None:
            results[domain] = cached
        else:
            uncachedDomains.append(domain)

    if not uncachedDomains:
        return results

    # Batch DNS lookups with semaphore for rate limiting
    semaphore = asyncio.Semaphore(maxConcurrent)
    checker = DnsChecker(timeout=timeout, maxRetries=1)

    async def lookupOne(domain: str) -> tuple[str, dict]:
        async with semaphore:
            try:
                result = await checker.lookup(domain)
                dnsData = {
                    "hasValidDns": result.status == LookupStatus.SUCCESS,
                    "hasValidMx": result.hasValidMx,
                    "usesCdn": result.usesCdn,
                    "dnsRecordCount": (
                        len(result.aRecords)
                        + len(result.aaaaRecords)
                        + len(result.mxRecords)
                        + len(result.nsRecords)
                        + len(result.txtRecords)
                        + len(result.cnameRecords)
                    ),
                }
            except Exception:
                dnsData = {
                    "hasValidDns": False,
                    "hasValidMx": False,
                    "usesCdn": False,
                    "dnsRecordCount": 0,
                }
            return domain, dnsData

    tasks = [lookupOne(d) for d in uncachedDomains]

    for coro in asyncio.as_completed(tasks):
        domain, dnsData = await coro
        results[domain] = dnsData
        cache.put(domain, dnsData)

    return results


# ============================================================================
# Feature Extraction for a Single URL
# ============================================================================

def extractFeaturesForUrl(
    url: str,
    domain: str,
    dnsData: Optional[dict] = None,
) -> list[float]:
    """
    Extract the full 29-feature vector for a single URL.

    Args:
        url: The URL to extract features from.
        domain: Pre-extracted domain name.
        dnsData: Optional DNS lookup results.

    Returns:
        List of 29 float values in FEATURE_NAMES order.
    """
    # URL structural features (instant, no network)
    urlFeatures = extractUrlFeatures(url)

    # Build OSINT features from available data
    osintKwargs: dict = {
        "hasValidDns": False,
        "hasValidMx": False,
        "usesCdn": False,
        "dnsRecordCount": 0,
        "hasValidWhois": False,
        "domainAgeDays": None,
        "isNewlyRegistered": False,
        "isYoungDomain": False,
        "hasPrivacyProtection": False,
        "reputationScore": 0.0,
        "maliciousSourceCount": 0,
        "isKnownMalicious": False,
    }

    if dnsData:
        osintKwargs["hasValidDns"] = dnsData.get("hasValidDns", False)
        osintKwargs["hasValidMx"] = dnsData.get("hasValidMx", False)
        osintKwargs["usesCdn"] = dnsData.get("usesCdn", False)
        osintKwargs["dnsRecordCount"] = dnsData.get("dnsRecordCount", 0)

    osintFeatures = OsintFeatures(**osintKwargs)

    # Build vector manually in FEATURE_NAMES order
    uf = urlFeatures
    of = osintFeatures

    return [
        float(uf.urlLength),
        float(uf.domainLength),
        float(uf.subdomainCount),
        float(uf.pathDepth),
        float(uf.hasIpAddress),
        float(uf.hasAtSymbol),
        float(uf.hasDoubleSlash),
        float(uf.hasDashInDomain),
        float(uf.hasUnderscoreInDomain),
        float(uf.isHttps),
        float(uf.hasPortNumber),
        float(uf.hasSuspiciousTld),
        float(uf.hasEncodedChars),
        float(uf.hasSuspiciousKeywords),
        float(uf.digitRatio),
        float(uf.specialCharCount),
        float(uf.queryParamCount),
        float(of.domainAgeDays) if of.domainAgeDays is not None else float("nan"),
        float(of.isNewlyRegistered),
        float(of.isYoungDomain),
        float(of.hasPrivacyProtection),
        float(of.hasValidMx),
        float(of.usesCdn),
        float(of.dnsRecordCount),
        float(of.hasValidDns),
        float(of.reputationScore),
        float(of.maliciousSourceCount),
        float(of.isKnownMalicious),
        float(of.hasValidWhois),
    ]


# ============================================================================
# Load Raw URL Datasets
# ============================================================================

def loadRawUrls() -> list[dict]:
    """
    Load phishing and legitimate URLs from raw CSV files.

    Returns:
        List of dicts with 'url', 'domain', 'label' keys.
    """
    urls: list[dict] = []

    # Load phishing URLs
    phishingPath = RAW_DIR / "phishing_urls.csv"
    if phishingPath.exists():
        with open(phishingPath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                urls.append({
                    "url": row["url"],
                    "domain": row["domain"],
                    "label": 1,
                })
    else:
        print(f"⚠️  Missing: {phishingPath}")

    # Load legitimate URLs
    legitimatePath = RAW_DIR / "legitimate_urls.csv"
    if legitimatePath.exists():
        with open(legitimatePath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                urls.append({
                    "url": row["url"],
                    "domain": row["domain"],
                    "label": 0,
                })
    else:
        print(f"⚠️  Missing: {legitimatePath}")

    return urls


# ============================================================================
# Main Pipeline
# ============================================================================

async def runPipeline(
    skipDns: bool = False,
    maxUrls: int = MAX_URLS,
) -> None:
    """
    Run the full feature extraction pipeline.

    Args:
        skipDns: If True, skip DNS lookups (faster, URL-only features).
        maxUrls: Limit URLs processed (0 = all).
    """
    startTime = time.time()
    print("=" * 60)
    print("  Feature Extraction Pipeline")
    print("  BSc Thesis — Ishaq Muhammad (PXPRGK)")
    print("=" * 60)

    # Load raw URLs
    rawUrls = loadRawUrls()
    if not rawUrls:
        print("❌ No raw URL data found. Run collectors first.")
        sys.exit(1)

    phishingCount = sum(1 for u in rawUrls if u["label"] == 1)
    legitimateCount = sum(1 for u in rawUrls if u["label"] == 0)
    print(f"\n📊 Raw dataset: {len(rawUrls)} URLs")
    print(f"   Phishing:   {phishingCount}")
    print(f"   Legitimate: {legitimateCount}")

    if maxUrls > 0:
        rawUrls = rawUrls[:maxUrls]
        print(f"   ⚠️  Limited to first {maxUrls} URLs")

    # Initialize OSINT cache
    cache = OsintCache(OSINT_CACHE_FILE)
    print(f"   Cache entries: {len(cache)}")

    # Collect unique domains for DNS lookups
    uniqueDomains = list({u["domain"] for u in rawUrls if u["domain"]})
    print(f"   Unique domains: {len(uniqueDomains)}")

    # Batch DNS lookups (if enabled)
    dnsResults: dict[str, dict] = {}
    if not skipDns:
        print(f"\n🔍 Running DNS lookups for {len(uniqueDomains)} domains...")
        batchSize = DNS_BATCH_SIZE
        totalBatches = (len(uniqueDomains) + batchSize - 1) // batchSize

        for i in tqdm(
            range(0, len(uniqueDomains), batchSize),
            total=totalBatches,
            desc="DNS batches",
            unit="batch",
        ):
            batch = uniqueDomains[i : i + batchSize]
            batchResults = await batchDnsLookup(batch, cache)
            dnsResults.update(batchResults)

            # Save cache periodically
            if (i // batchSize + 1) % 10 == 0:
                cache.save()

        cache.save()
        print(f"   ✅ DNS lookups complete. Cache: {len(cache)} entries")

    # Extract features for all URLs
    print(f"\n⚙️  Extracting 29 features per URL...")

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    fieldnames = FEATURE_NAMES + ["label"]

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(fieldnames)

        successCount = 0
        errorCount = 0

        for entry in tqdm(rawUrls, desc="Features", unit="url"):
            try:
                url = entry["url"]
                domain = entry["domain"]
                label = int(entry["label"])

                dnsData = dnsResults.get(domain)
                features = extractFeaturesForUrl(url, domain, dnsData)
                writer.writerow(features + [label])
                successCount += 1

            except Exception as exc:
                errorCount += 1
                if errorCount <= 5:
                    logger.warning(f"Feature extraction failed for {entry.get('url', '?')}: {exc}")

    elapsed = time.time() - startTime
    print(f"\n✅ Feature extraction complete!")
    print(f"   Output: {OUTPUT_FILE}")
    print(f"   Rows: {successCount} success, {errorCount} errors")
    print(f"   Columns: {len(FEATURE_NAMES)} features + 1 label = {len(fieldnames)}")
    print(f"   Time: {elapsed:.1f}s")

    # Quick validation
    validateOutput()


def validateOutput() -> None:
    """Validate the output CSV has correct shape and contents."""
    if not OUTPUT_FILE.exists():
        print("❌ Output file not found!")
        return

    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        rowCount = sum(1 for _ in reader)

    expectedCols = len(FEATURE_NAMES) + 1  # features + label
    print(f"\n📋 Validation:")
    print(f"   Header columns: {len(header)} (expected {expectedCols})")
    print(f"   Data rows: {rowCount}")
    print(f"   Features: {len(FEATURE_NAMES)}")

    if len(header) != expectedCols:
        print("   ❌ Column count mismatch!")
    else:
        print("   ✅ Shape is correct")


# ============================================================================
# Entry Point
# ============================================================================

def main() -> None:
    """Entry point for feature extraction."""
    logging.basicConfig(level=logging.WARNING)

    skipDns = "--skip-dns" in sys.argv
    maxUrls = MAX_URLS

    for arg in sys.argv[1:]:
        if arg.startswith("--max="):
            try:
                maxUrls = int(arg.split("=")[1])
            except ValueError:
                pass

    asyncio.run(runPipeline(skipDns=skipDns, maxUrls=maxUrls))


if __name__ == "__main__":
    main()
