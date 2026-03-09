# Background Research: Phishing Detection Using OSINT-Enhanced Features

## 1. Phishing Threat Landscape

### What is Phishing?
Phishing is a cybersecurity attack that uses deceptive emails, websites, or messages to trick users into revealing sensitive information (passwords, credit cards, personal data). Attackers impersonate trusted entities like banks, social media platforms, or colleagues.

### Types of Phishing
| Type | Description |
|------|-------------|
| **Email Phishing** | Mass emails mimicking legitimate organizations |
| **Spear Phishing** | Targeted attacks on specific individuals |
| **Whaling** | Targeting high-profile executives |
| **Smishing** | SMS-based phishing |
| **Vishing** | Voice call phishing |
| **Clone Phishing** | Cloning legitimate emails with malicious links |

### Why Traditional Detection Fails
- Relies only on email text/structure
- No external intelligence about domain authenticity
- Attackers constantly evolve tactics
- Zero-day phishing sites bypass signature-based detection

---

## 2. OSINT (Open-Source Intelligence) Techniques

### What is OSINT?
Publicly available information collected from open sources to enrich threat intelligence.

### OSINT Features for Phishing Detection

| Feature | Source | Why It Matters |
|---------|--------|----------------|
| **Domain Age** | WHOIS | New domains (<30 days) are often malicious |
| **Registrar Info** | WHOIS | Cheap/anonymous registrars = red flag |
| **DNS Records** | DNS Lookup | Missing MX records, suspicious IPs |
| **SSL Certificate** | Certificate Transparency | Self-signed, mismatched, or missing certs |
| **Alexa/Popularity Rank** | Web APIs | Legitimate sites have traffic history |
| **Blacklist Status** | PhishTank, Google Safe Browsing | Known malicious URLs |
| **IP Geolocation** | MaxMind, IP2Location | Hosting in suspicious regions |
| **Redirects** | HTTP Analysis | Multiple redirects = evasion technique |

### Tools We'll Use
- **python-whois** - WHOIS lookups for domain info
- **dnspython** - DNS record resolution
- **Google Safe Browsing API** - Blacklist checking
- **PhishTank API** - Crowd-sourced phishing database

---

## 3. Machine Learning Approaches

### Feature Categories

#### Text-Based Features (NLP)
- Urgency keywords ("act now", "verify immediately")
- Suspicious phrases ("confirm your account")
- Grammar/spelling errors
- Sender name vs email mismatch

#### URL Structural Features (17 features)
- `urlLength`, `domainLength` — length-based anomalies
- `subdomainCount`, `pathDepth` — structural complexity
- `hasIpAddress`, `hasAtSymbol`, `hasDoubleSlash` — redirect tricks
- `hasDashInDomain`, `hasUnderscoreInDomain` — impersonation indicators
- `isHttps`, `hasPortNumber` — protocol anomalies
- `hasSuspiciousTld`, `hasEncodedChars` — evasion techniques
- `hasSuspiciousKeywords` — keyword-based detection
- `digitRatio`, `specialCharCount`, `queryParamCount` — statistical features

#### OSINT Features (4 features, collected in real-time)
- `hasValidMx` — mail server configuration exists
- `usesCdn` — domain uses CDN (Cloudflare, Akamai, etc.)
- `dnsRecordCount` — number of DNS records
- `hasValidDns` — domain resolves successfully

### ML Algorithms Comparison

| Algorithm | Pros | Cons | Use Case |
|-----------|------|------|----------|
| **Random Forest** | High accuracy, handles mixed features | Less interpretable | Baseline comparison |
| **Logistic Regression** | Fast, interpretable | Limited for complex patterns | Baseline comparison |
| **SVM** | Good for high-dimensional data | Slow training on large datasets | Alternative model |
| **XGBoost** | State-of-the-art accuracy, handles mixed features | Complex tuning | Our primary model |
| **Neural Networks** | Can learn complex patterns | Needs large data, black-box | Future work |

### Our Approach
1. **Feature Engineering**: 21 features (17 URL structural + 4 OSINT)
2. **Hyperparameter Optimization**: Optuna with 50 trials, 5-fold CV
3. **Model Training**: XGBoost classifier on 23,374 samples
4. **Evaluation**: Test set (5,009 samples) — 96.45% accuracy, 99.41% AUC-ROC
5. **Explainability**: SHAP TreeExplainer for feature importance

---

## 4. Datasets

### PhishTank (Primary Dataset)
- **Source**: https://phishtank.org/
- **Format**: JSON/CSV with verified phishing URLs
- **Size**: ~75,000+ verified phishing URLs
- **Features**: URL, submission time, verification status, target brand
- **Update**: Hourly updates available

### Additional Datasets

| Dataset | Description | Size |
|---------|-------------|------|
| **Kaggle Phishing Dataset** | Labeled phishing/legitimate URLs | ~10,000 |
| **ISCX-URL-2016** | Academic benchmark dataset | 36,400 URLs |
| **Alexa Top Sites** | Legitimate URLs for training | Top 1M |
| **OpenPhish** | Community-driven phishing feed | Real-time |

### Data Preprocessing Pipeline
1. Collect phishing URLs from PhishTank (verified entries)
2. Collect legitimate URLs from Tranco Top Sites + synthetic path augmentation
3. Extract 21 features per URL (17 structural + 4 OSINT via DNS)
4. Label: 1 (phishing) / 0 (legitimate)
5. Split: 70% train (23,374), 15% validation (5,009), 15% test (5,009)
6. Total feature-engineered samples: 150,391

---

## 5. NLP-Based Phishing Analysis (Implemented in M2)

### Approach: spaCy Rule-Based NLP

Our system uses spaCy's rule-based NLP components rather than a trained ML classifier for the initial implementation. This provides:
- **Deterministic results** — same input always produces same output
- **Explainable detections** — every detection maps to a specific rule
- **No training data needed** — works immediately with curated patterns
- **Easy to extend** — add new patterns without retraining

### Architecture

```
Input Text → spaCy Pipeline → Pattern Matchers → Score Aggregation → Verdict
                 │
                 ├── PhraseMatcher (urgency, threats, credentials)
                 ├── EntityRuler (brand detection)
                 └── Token Matcher (suspicious request patterns)
```

### Phishing Indicator Categories

| # | Category | Detection Method | Example Patterns | Count |
|---|----------|-----------------|-------------------|-------|
| 1 | Urgency Keywords | PhraseMatcher | "act now", "immediately", "within 24 hours" | 15+ |
| 2 | Threat Phrases | PhraseMatcher | "account suspended", "unauthorized access" | 20+ |
| 3 | Authority Impersonation | EntityRuler | "IT Department", "Security Team", "PayPal" | 30+ |
| 4 | Suspicious Requests | Token Matcher | "verify password", "confirm SSN" | 15+ |
| 5 | Credential Harvesting | PhraseMatcher | "click here to login", "enter your details" | 15+ |
| 6 | Fear Tactics | PhraseMatcher | "your account will be closed", "legal action" | 15+ |

### Feature Extraction Methodology

Features are extracted at two levels:

**URL Features (10 indicators):**
| Feature | Type | Scoring Logic |
|---------|------|--------------|
| urlLength | int | >75 chars → suspicious |
| domainLength | int | >25 chars → suspicious |
| subdomainCount | int | >2 → suspicious |
| hasIpAddress | bool | True → high risk |
| hasAtSymbol | bool | True → redirect trick |
| hasDashInDomain | bool | True → impersonation indicator |
| digitRatio | float | >0.3 → suspicious |
| specialCharCount | int | >3 → suspicious |
| isHttps | bool | False → no encryption |
| pathDepth | int | >4 → suspicious |

**OSINT Features (enrichment):**
| Feature | Source | Scoring Logic |
|---------|--------|--------------|
| domainAgeDays | WHOIS | <30 days → high risk |
| isPrivate | WHOIS | True → hides identity |
| hasValidDns | DNS | False → infrastructure issues |
| reputationScore | Multi-source | >0.5 → suspicious |
| inBlacklists | Reputation | True → known malicious |

### Scoring Architecture

The system uses an **ML-primary scoring architecture**. For URL analysis, the
trained XGBoost classifier provides the primary score:

```
URL Analysis:  finalScore = mlPrediction × 0.85 + nlpScore × 0.15
Text Analysis: finalScore = nlpScore × 0.55 + urlScore × 0.25 + osintScore × 0.20
```

The ML model operates on a 21-feature vector (17 URL structural + 4 OSINT)
and outputs a phishing probability. A threshold of 0.5 determines the
binary classification.

| Score Range | Threat Level | Action |
|-------------|-------------|--------|
| 0.00 – 0.29 | Safe | Proceed normally |
| 0.30 – 0.49 | Suspicious | Verify source |
| 0.50 – 0.69 | Dangerous | Do not interact |
| 0.70 – 1.00 | Critical | Report immediately |

### Comparison: Rule-Based NLP vs ML Classification

| Aspect | Rule-Based (Current) | ML Classifier (Future) |
|--------|---------------------|----------------------|
| Training data | Not needed | Requires labeled dataset |
| Accuracy | ~85-90% (estimated) | ~95%+ (with good data) |
| Explainability | High (each rule traceable) | Low-Medium (SHAP needed) |
| New patterns | Manual addition | Automatic learning |
| False positives | Controllable | Data-dependent |
| Latency | <100ms | ~200-500ms |

### Future: LLM Integration Path

The analyzer module uses an abstract base class (`BaseAnalyzer`), enabling easy swapping:
1. Current: `NlpAnalyzer` — spaCy rule-based
2. Future: `LlmAnalyzer` — Ollama/vLLM with structured output
3. Switch via: `ANALYZER_ENGINE=llm` in `.env`

---

## 6. Existing Solutions & Baseline Comparisons

### Academic Research

| Paper | Method | Accuracy | Year |
|-------|--------|----------|------|
| "Phishing Detection Using ML" (IEEE) | Random Forest + URL features | 97.2% | 2021 |
| "OSINT-based Phishing Analysis" | WHOIS + DNS features | 94.5% | 2022 |
| "Deep Learning for Phishing" | CNN + NLP | 98.1% | 2023 |
| "Explainable Phishing Detection" | SHAP + Random Forest | 96.3% | 2023 |

### Commercial Tools

| Tool | Approach | Limitation |
|------|----------|------------|
| Google Safe Browsing | Blacklist-based | Misses zero-day attacks |
| PhishTank | Crowd-sourced verification | Delayed detection |
| Proofpoint | Email gateway filtering | Enterprise-only, expensive |
| Microsoft Defender | Heuristic + ML | Closed-source |

### Our Differentiator
- **Open-source** and transparent
- **OSINT enrichment** for better context
- **Explainable results** - users see WHY something is phishing
- **Real-time analysis** - not just blacklist checking

---

## 6. Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|----------|
| **Python** | 3.10 | Core language — ML ecosystem, async support |
| **FastAPI** | 0.109.0 | REST API — async, auto-docs, Pydantic validation |
| **XGBoost** | 3.2.0 | ML classifier — gradient boosted trees |
| **spaCy** | 3.7.2 | NLP — rule-based phishing indicator detection |
| **SHAP** | 0.49.1 | Model explainability — TreeExplainer |
| **Optuna** | 4.7.0 | Hyperparameter optimization — Bayesian search |
| **scikit-learn** | 1.4.0 | ML utilities — metrics, preprocessing |
| **python-whois** | 0.8.0 | WHOIS domain registration lookups |
| **dnspython** | 2.5.0 | DNS record resolution and validation |
| **Pydantic** | 2.5.3 | Data validation and settings management |

### Frontend
| Technology | Version | Purpose |
|------------|---------|----------|
| **Next.js** | 16.1.6 | React framework — App Router, SSR, Turbopack |
| **React** | 19.2.3 | UI library — server components, hooks |
| **TypeScript** | 5.x | Type safety across entire frontend |
| **Tailwind CSS** | 4.x | Utility-first styling with dark mode |
| **shadcn/ui** | 4.x | Accessible component library (base-nova) |
| **Recharts** | 2.x | SVG charts for score visualisation |
| **Motion** | 12.35 | Page transitions and animations |

### External APIs
| API | Purpose | Usage |
|-----|---------|-------|
| **VirusTotal** | Multi-engine malware scan | Optional, free tier |
| **AbuseIPDB** | IP abuse confidence score | Optional, free tier |

---

## 7. Evaluation Metrics

### Classification Metrics
- **Accuracy** - Overall correctness
- **Precision** - Of predicted phishing, how many were correct
- **Recall** - Of actual phishing, how many were detected
- **F1-Score** - Harmonic mean of precision and recall
- **ROC-AUC** - Model discrimination ability

### Achieved Results (XGBoost on Test Set — 5,009 samples)
| Metric | Target | Achieved |
|--------|--------|----------|
| Accuracy | >95% | **96.45%** |
| Precision | >90% | **97.86%** |
| Recall | >95% | **94.97%** |
| F1-Score | >93% | **96.39%** |
| ROC-AUC | >95% | **99.41%** |
| PR-AUC | >95% | **99.48%** |

---

## 8. Limitations & Future Work

### Known Limitations
- OSINT lookups add latency (1-3 seconds per URL)
- WHOIS privacy protection hides some data
- New domains with no history are harder to classify
- API rate limits (Google Safe Browsing, PhishTank)

### Future Improvements
- Real-time streaming detection
- Browser extension integration
- Email client plugin
- Deep learning models (BERT for text)
- Phishing campaign clustering

---

## 9. References

1. Mohammad, R. M., et al. "Predicting phishing websites based on self-structuring neural network." Neural Computing and Applications, 2014.

2. Sahingoz, O. K., et al. "Machine learning based phishing detection from URLs." Expert Systems with Applications, 2019.

3. Abutair, H., et al. "Using Case-Based Reasoning for Phishing Detection." Procedia Computer Science, 2019.

4. Rao, R. S., & Pais, A. R. "Detection of phishing websites using an efficient feature-based machine learning framework." Neural Computing and Applications, 2019.

5. PhishTank Documentation: https://phishtank.org/developer_info.php

6. Google Safe Browsing API: https://developers.google.com/safe-browsing

7. WHOIS Protocol (RFC 3912): https://datatracker.ietf.org/doc/html/rfc3912

---

*Research compiled for BSc Thesis: Phishing Detection Using OSINT-Enhanced Features*
*ELTE Faculty of Informatics — Updated March 2026*
