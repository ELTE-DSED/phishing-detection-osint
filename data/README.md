# Data Directory

## Overview
This directory contains datasets used for phishing detection research, model training, and evaluation.

## Structure
```
data/
├── phishtank/
│   └── phishingUrls.json      # 115 verified phishing URL patterns (test fixtures)
├── legitimate/
│   └── legitimateUrls.json    # 225 verified legitimate URLs (test fixtures)
├── raw/
│   ├── phishing_urls.csv      # Raw phishing URLs from PhishTank API
│   ├── legitimate_urls.csv    # Raw legitimate URLs from Tranco Top Sites
│   └── osint_cache.json       # Cached OSINT lookup results
├── processed/
│   ├── features_raw.csv       # 150,391 feature-engineered URLs (21 features each)
│   ├── train.csv              # Training set (23,374 samples, 70%)
│   ├── val.csv                # Validation set (5,009 samples, 15%)
│   ├── test.csv               # Test set (5,009 samples, 15%)
│   └── dataset_stats.json     # Dataset statistics and metadata
├── evaluation/
│   ├── evaluation_report.json # Full evaluation metrics (accuracy, F1, AUC, PR-AUC)
│   ├── ablation_report.json   # OSINT ablation study results
│   ├── confusion_matrix.png   # Confusion matrix visualisation
│   ├── roc_curve.png          # ROC curve plot
│   ├── precision_recall_curve.png # Precision-recall curve
│   ├── feature_importance.png # XGBoost feature importance bar chart
│   ├── ablation_comparison.png # With/without OSINT comparison
│   ├── shap_summary.png       # SHAP beeswarm summary plot
│   ├── shap_bar.png           # SHAP mean absolute bar chart
│   ├── shap_waterfall.png     # SHAP waterfall for single prediction
│   └── shap_values.npy        # Raw SHAP values array
├── scripts/
│   ├── collectPhishtank.py    # PhishTank data collection script
│   └── collectLegitimate.py   # Legitimate URL collection script
└── README.md
```

## Training Dataset

### Feature-Engineered Dataset (`processed/features_raw.csv`)
- **Total samples:** 150,391 URLs
- **Sources:** PhishTank (phishing) + Tranco Top Sites (legitimate)
- **Features per sample:** 21 (17 URL structural + 4 OSINT)
- **Label:** `isPhishing` (binary: 0 = legitimate, 1 = phishing)

### Feature Vector (21 features)

| # | Feature | Type | Description |
|---|---------|------|-------------|
| 1 | `urlLength` | URL | Total URL character count |
| 2 | `domainLength` | URL | Domain name character count |
| 3 | `subdomainCount` | URL | Number of subdomains |
| 4 | `pathDepth` | URL | Depth of URL path segments |
| 5 | `hasIpAddress` | URL | IP address used instead of domain |
| 6 | `hasAtSymbol` | URL | Contains @ symbol |
| 7 | `hasDoubleSlash` | URL | Contains // after protocol |
| 8 | `hasDashInDomain` | URL | Hyphen in domain name |
| 9 | `hasUnderscoreInDomain` | URL | Underscore in domain name |
| 10 | `isHttps` | URL | Uses HTTPS protocol |
| 11 | `hasPortNumber` | URL | Explicit port number present |
| 12 | `hasSuspiciousTld` | URL | Known suspicious TLD |
| 13 | `hasEncodedChars` | URL | URL-encoded characters present |
| 14 | `hasSuspiciousKeywords` | URL | Phishing-related keywords |
| 15 | `digitRatio` | URL | Ratio of digits in URL |
| 16 | `specialCharCount` | URL | Count of special characters |
| 17 | `queryParamCount` | URL | Number of query parameters |
| 18 | `hasValidMx` | OSINT | Valid MX records exist |
| 19 | `usesCdn` | OSINT | Domain uses a CDN |
| 20 | `dnsRecordCount` | OSINT | Number of DNS records |
| 21 | `hasValidDns` | OSINT | Domain has valid DNS resolution |

### Train/Validation/Test Split

| Split | File | Count | Ratio |
|-------|------|-------|-------|
| Train | `train.csv` | 23,374 | 70% |
| Validation | `val.csv` | 5,009 | 15% |
| Test | `test.csv` | 5,009 | 15% |
| **Total** | — | **150,391** | — |

> Note: Split uses stratified sampling to maintain class balance across all sets.

## Test Fixture Datasets

### Phishing URLs (`phishtank/phishingUrls.json`)
- **Source:** PhishTank community database patterns
- **Count:** 115 URLs
- **Categories:** credential_harvesting, subdomain_abuse, homograph, ip_based, url_shortener, fear_tactic, urgency, reward_scam, punycode, and more
- **Targets:** PayPal, Apple, Microsoft, Google, Amazon, Netflix, banks, government agencies, crypto platforms

### Legitimate URLs (`legitimate/legitimateUrls.json`)
- **Source:** Tranco Top Sites List + manual curation
- **Count:** 225 URLs
- **Categories:** search_engine, social_media, ecommerce, technology, news, email, financial, education, entertainment, government, cloud, developer, and more

## Evaluation Outputs

The `evaluation/` directory contains model evaluation artefacts generated during training:

- **Metrics:** `evaluation_report.json` — accuracy, F1, AUC-ROC, PR-AUC for train/val/test sets
- **Ablation:** `ablation_report.json` — comparison of model performance with and without OSINT features
- **SHAP:** `shap_values.npy` + visualisation PNGs — feature importance and explainability analysis
- **Plots:** Confusion matrix, ROC curve, precision-recall curve, feature importance charts

## Usage

### Regenerate Test Fixture Datasets
```bash
python data/scripts/collectPhishtank.py
python data/scripts/collectLegitimate.py
```

### Regenerate Training Dataset
```bash
# Run the full ML pipeline (collection → extraction → split → train → evaluate)
python -m backend.ml.pipeline
```

### JSON Structure (Test Fixtures)
Each fixture dataset JSON has:
```json
{
  "metadata": {
    "source": "...",
    "totalUrls": 115,
    "categories": ["..."],
    "collectedAt": "2026-02-10T..."
  },
  "urls": [
    {
      "id": 1,
      "url": "http://...",
      "domain": "...",
      "category": "...",
      "isPhishing": true
    }
  ]
}
```

## Notes
- All phishing URLs are patterns based on real-world attacks documented by PhishTank
- Legitimate URLs are from globally recognised, verified top-ranked domains
- Training data (`processed/`) is generated programmatically and excluded from Git via `.gitignore`
- Evaluation artefacts (`evaluation/`) are tracked in Git for reproducibility
- Data is used for model training, evaluation, and thesis research only
