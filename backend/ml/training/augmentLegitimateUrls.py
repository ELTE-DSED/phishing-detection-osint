"""
Augment Legitimate URL Features with Realistic Path Variations
================================================================

The Tranco-sourced legitimate URLs are bare domains (pathDepth=0,
queryParamCount=0). Real-world legitimate URLs include paths, query
parameters, and ``www.`` subdomains.  This script generates synthetic
variants by modifying only the URL-structural features while copying
the OSINT features from the base domain.

This is necessary because the model otherwise learns "any path = phishing"
which is clearly a false signal.

Output
------
Overwrites ``data/processed/features_raw.csv`` with the augmented data.

Usage
-----
    python -m backend.ml.training.augmentLegitimateUrls

Author: Ishaq Muhammad (PXPRGK)
Course: BSc Thesis - ELTE Faculty of Informatics
"""

from __future__ import annotations

import logging
import random
from pathlib import Path

import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[3]
FEATURES_RAW_PATH = PROJECT_ROOT / "data" / "processed" / "features_raw.csv"

COMMON_PATHS = [
    "/login", "/search", "/about", "/contact", "/help",
    "/news", "/support", "/account", "/settings", "/profile",
    "/docs", "/api", "/blog", "/faq", "/terms",
    "/privacy", "/careers", "/products", "/services",
    "/download", "/store", "/mail", "/maps", "/drive",
]

DEEP_PATHS = [
    "/account/settings", "/user/profile", "/help/support",
    "/docs/api/reference", "/blog/2024/post", "/news/latest/article",
    "/products/item/details", "/store/checkout/confirm",
]

QUERY_PATTERNS = [
    {"queryParamCount": 1, "extraLength": 8},
    {"queryParamCount": 2, "extraLength": 16},
    {"queryParamCount": 3, "extraLength": 25},
]

RANDOM_SEED = 42
VARIANTS_PER_DOMAIN = 4


def augmentLegitimateUrls() -> pd.DataFrame:
    """Read features_raw.csv, augment legitimate rows, and return full DataFrame."""
    logger.info("Reading %s", FEATURES_RAW_PATH)
    df = pd.read_csv(FEATURES_RAW_PATH)

    legitMask = df["label"] == 0
    phishMask = df["label"] == 1
    legitDf = df[legitMask].copy()
    phishDf = df[phishMask].copy()

    logger.info(
        "Original counts — Legitimate: %d, Phishing: %d",
        len(legitDf),
        len(phishDf),
    )

    random.seed(RANDOM_SEED)
    augmentedRows: list[dict] = []

    for _, row in legitDf.iterrows():
        baseDomainLength = row["domainLength"]
        baseUrlLength = row["urlLength"]
        baseSubdomainCount = row["subdomainCount"]

        for _ in range(VARIANTS_PER_DOMAIN):
            newRow = row.to_dict()
            variant = random.random()

            if variant < 0.3:
                path = random.choice(COMMON_PATHS)
                newRow["pathDepth"] = 1
                pathExtra = len(path)
            elif variant < 0.55:
                path = random.choice(DEEP_PATHS)
                newRow["pathDepth"] = path.count("/")
                pathExtra = len(path)
            elif variant < 0.75:
                path = random.choice(COMMON_PATHS)
                newRow["pathDepth"] = 1
                qp = random.choice(QUERY_PATTERNS)
                newRow["queryParamCount"] = qp["queryParamCount"]
                pathExtra = len(path) + qp["extraLength"]
            else:
                path = random.choice(COMMON_PATHS)
                newRow["pathDepth"] = 1
                pathExtra = len(path)
                newRow["subdomainCount"] = baseSubdomainCount + 1
                pathExtra += 4

            newRow["urlLength"] = baseUrlLength + pathExtra
            newRow["specialCharCount"] = max(
                0, newRow.get("specialCharCount", 0) + newRow["pathDepth"] - 1
            )

            augmentedRows.append(newRow)

    augmentedDf = pd.DataFrame(augmentedRows)

    logger.info("Generated %d augmented legitimate rows", len(augmentedDf))

    result = pd.concat([df, augmentedDf], ignore_index=True)
    result = result.sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)

    logger.info("Final dataset: %d rows (%d original + %d augmented)",
                len(result), len(df), len(augmentedDf))

    result.to_csv(FEATURES_RAW_PATH, index=False)
    logger.info("Saved augmented data to %s", FEATURES_RAW_PATH)

    return result


if __name__ == "__main__":
    augmentLegitimateUrls()
