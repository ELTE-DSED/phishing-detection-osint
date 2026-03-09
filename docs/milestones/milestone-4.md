# Milestone 4/5 — ML Training, Deployment & Final Documentation

**Deadline:** April 15, 2026 (M4) / May 1, 2026 (Final Submission)
**Status:** ✅ Complete

---

## Overview

Milestones 4 and 5 were merged into a single sprint covering ML model training, production deployment, and final documentation. All 16 issues (#61–#76) have been completed and closed.

---

## Deliverables

### ML Infrastructure & Training (Issues #61–#66)

| # | Feature | Status |
|---|---------|--------|
| #61 | ML infrastructure (XGBoost, SHAP, Optuna integration) | ✅ |
| #62 | Data collection pipeline (150,391 URLs from PhishTank + Tranco) | ✅ |
| #63 | Feature extraction (21-feature vector: 17 URL + 4 OSINT) | ✅ |
| #64 | Dataset preparation (70/15/15 train/val/test split) | ✅ |
| #65 | XGBoost model training (Optuna 50-trial hyperparameter optimisation) | ✅ |
| #66 | Model evaluation (confusion matrix, ROC, PR curve, SHAP plots) | ✅ |

### Model Integration & API (Issues #67–#72)

| # | Feature | Status |
|---|---------|--------|
| #67 | SHAP explainability analysis (TreeExplainer, summary/waterfall/bar plots) | ✅ |
| #68 | Model integration into scorer (ML-primary scoring: 85% ML + 15% NLP) | ✅ |
| #69 | Orchestrator wiring (end-to-end ML pipeline in analysis flow) | ✅ |
| #70 | CORS configuration (production cross-origin support) | ✅ |
| #71 | API endpoint wiring (`/api/model/status`, model health in `/api/health`) | ✅ |
| #72 | Ablation study (with/without OSINT feature comparison) | ✅ |

### Deployment & Verification (Issues #73–#76)

| # | Feature | Status |
|---|---------|--------|
| #73 | Methodology page update (ML-primary architecture, scoring breakdown) | ✅ |
| #74 | Deployment configuration (render.yaml, vercel.json, production configs) | ✅ |
| #75 | Production deployment (Render backend + Vercel frontend) | ✅ |
| #76 | Smoke test and verification (health check, model status, URL analysis) | ✅ |

---

## ML Model Results

### XGBoost Classifier Performance

| Metric | Train | Validation | Test |
|--------|-------|------------|------|
| **Accuracy** | 99.79% | 96.57% | 96.45% |
| **F1 Score** | 99.78% | 96.50% | 96.39% |
| **AUC-ROC** | 100.00% | 99.49% | 99.41% |
| **PR-AUC** | 100.00% | 99.51% | 99.48% |

### Dataset

| Split | Count | Ratio |
|-------|-------|-------|
| Train | 23,374 | 70% |
| Validation | 5,009 | 15% |
| Test | 5,009 | 15% |
| **Total** | **150,391** | — |

### Hyperparameter Optimisation (Optuna)

- **Trials:** 50 (5-fold cross-validation)
- **Best trial:** #43 (AUC = 0.9943)
- **Key parameters:** `max_depth=8`, `n_estimators=494`, `learning_rate=0.118`, `subsample=0.847`

### Feature Vector (21 features)

**URL Structural (17):** `urlLength`, `domainLength`, `subdomainCount`, `pathDepth`, `hasIpAddress`, `hasAtSymbol`, `hasDoubleSlash`, `hasDashInDomain`, `hasUnderscoreInDomain`, `isHttps`, `hasPortNumber`, `hasSuspiciousTld`, `hasEncodedChars`, `hasSuspiciousKeywords`, `digitRatio`, `specialCharCount`, `queryParamCount`

**OSINT (4):** `hasValidMx`, `usesCdn`, `dnsRecordCount`, `hasValidDns`

### OSINT Ablation Study

| Metric | Without OSINT | With OSINT | Improvement |
|--------|---------------|------------|-------------|
| Accuracy | 96.15% | 96.45% | +0.30% |
| F1 | 96.08% | 96.39% | +0.31% |
| AUC | 99.35% | 99.41% | +0.06% |

---

## Production Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Backend API | Render.com | https://phishguard-api-upl2.onrender.com |
| Frontend UI | Vercel | https://project-4soy4.vercel.app |

### Deployment Stack
- **Backend:** Render free tier, Python 3.10, `requirements-prod.txt`
- **Frontend:** Vercel, Next.js 16 with `output: 'standalone'`
- **Model:** `phishingModel.json` served from backend (tracked in Git)

---

## Test Summary

| Category | Count |
|----------|-------|
| Backend (pytest) | 593 |
| Frontend (Jest) | 133 |
| E2E (Playwright) | 28 |
| **Total** | **754** |

---

## Codebase Metrics

| Metric | Value |
|--------|-------|
| Backend Python files | 30 |
| Backend LOC | 12,084 |
| Frontend TS/TSX files | 94 |
| Frontend LOC | 10,078 |
| Test LOC | 9,700 |
| API endpoints | 11 |
| GitHub issues (closed) | 76 |
| Total commits | 85+ |

---

## Remaining for Final Submission (May 1)

- [ ] Complete thesis report (introduction, background, methodology, results, evaluation, conclusion)
- [ ] User guide with screenshots
- [ ] Final code cleanup and review
- [ ] Thesis PDF submission

---

*Completed: March 2026*
