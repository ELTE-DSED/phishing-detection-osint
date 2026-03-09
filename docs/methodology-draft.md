# Methodology and Preliminary Results

## BSc Thesis — Phishing Detection Using OSINT-Enhanced Features

**Author:** Ishaq Muhammad (PXPRGK)
**Supervisor:** Md. Easin Arafat
**Institution:** Eötvös Loránd University (ELTE) — Faculty of Informatics

---

## 1. System Architecture

### 1.1 Overview

PhishGuard is a full-stack phishing detection system that employs a three-layer
analysis pipeline. Each layer operates independently, producing a partial risk
score that is combined using a weighted linear formula to generate a final
confidence score and threat-level classification.

```
┌──────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│           Next.js 16 · React 19 · Tailwind CSS v4            │
└──────────────────────┬───────────────────────────────────────┘
                       │  REST API (JSON)
┌──────────────────────▼───────────────────────────────────────┐
│                      FastAPI Backend                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Text/NLP    │  │  URL Feature │  │  OSINT           │   │
│  │  Analysis    │  │  Extraction  │  │  Enrichment      │   │
│  │  (spaCy)     │  │  (heuristic) │  │  (WHOIS/DNS/     │   │
│  │              │  │              │  │   VirusTotal/     │   │
│  │  Weight: 40% │  │  Weight: 25% │  │   AbuseIPDB)     │   │
│  │              │  │              │  │  Weight: 35%      │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘   │
│         │                 │                  │               │
│  ┌──────▼─────────────────▼──────────────────▼───────────┐   │
│  │                   Scoring Engine                       │   │
│  │  finalScore = text×0.40 + url×0.25 + osint×0.35       │   │
│  │  Threat Level: safe | suspicious | dangerous | critical│   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

1. **Input Submission:** The user provides a URL, email body, or free-text via
   the frontend.
2. **Content-Type Detection:** The backend's `AnalysisOrchestrator`
   auto-detects the content type (URL, email, text) or uses the user-specified
   type.
3. **Parallel Analysis:** Three analysis layers run concurrently:
   - **NLP Analysis** (`TextAnalyzer`): spaCy NLP pipeline detects social
     engineering patterns.
   - **URL Feature Extraction** (`UrlAnalyzer` + `FeatureExtractor`): Parses
     URL structure and extracts heuristic features.
   - **OSINT Enrichment** (`WhoisLookup` + `DnsChecker` +
     `ReputationChecker`): Queries external intelligence sources.
4. **Score Calculation:** The `Scorer` combines partial scores with configured
   weights.
5. **Verdict Generation:** A threat level is assigned and the full result is
   returned to the frontend.
6. **Presentation:** The results page displays the verdict banner, confidence
   score, OSINT cards, feature summary, and interactive score visualisations.

---

## 2. Implementation Methodology

### 2.1 Technology Stack

| Layer       | Technology          | Version   | Justification                              |
|-------------|---------------------|-----------|--------------------------------------------|
| Frontend    | Next.js (App Router)| 16.1.6    | React 19, SSR support, file-based routing  |
| UI Library  | shadcn/ui + Base UI | v4        | Accessible, composable, theme-aware        |
| Styling     | Tailwind CSS        | v4        | Utility-first, responsive, dark mode       |
| Animation   | Motion (Framer)     | v12+      | Smooth transitions, layout animations      |
| Charts      | Recharts            | 3.8.0     | Declarative SVG charts for score display   |
| Data Tables | TanStack Table      | 8.21.3    | Headless, sortable, filterable tables      |
| Backend     | FastAPI             | 0.109.0   | Async Python API, auto-generated OpenAPI   |
| NLP         | spaCy               | 3.7.2     | Industrial-grade NLP, custom pipelines     |
| ML          | XGBoost             | 3.2.0     | Gradient boosted trees, high accuracy      |
| ML Explain  | SHAP                | 0.49.1    | TreeExplainer for feature importance       |
| ML Tuning   | Optuna              | 4.7.0     | Bayesian hyperparameter optimization       |
| ML Utils    | scikit-learn        | 1.4.0     | Feature extraction and scoring utilities   |
| OSINT       | python-whois        | 0.8.0     | WHOIS domain registration data             |
| DNS         | dnspython           | 2.5.0     | DNS record resolution and validation       |
| HTTP        | aiohttp             | 3.9.1     | Async HTTP for external API calls          |
| Config      | pydantic-settings   | 2.1.0     | Type-safe configuration from environment   |
| Logging     | structlog           | 24.1.0    | Structured JSON logging                    |

### 2.2 Design Patterns

1. **Protocol-Based Abstraction:** The `BaseAnalyzer` abstract class defines a
   common interface (`analyze`, `extractFeatures`, `calculateScore`) that all
   analysis modules implement, enabling polymorphic dispatch and easy extension.

2. **Dependency Injection:** The `AnalysisOrchestrator` receives its analysers
   and OSINT collectors as constructor parameters, enabling unit testing with
   mocks and allowing alternative implementations.

3. **Separation of Concerns:** The codebase is organised into four distinct
   modules (`api`, `ml`, `osint`, `analyzer`), each responsible for a single
   domain. Cross-module communication happens through well-defined Pydantic
   schemas.

4. **Client-Side State Management:** The frontend uses React Context
   (`ResultsContext`) for cross-page state and localStorage-backed stores for
   persistent settings and history.

5. **Dynamic Imports:** Heavy visualisation components (Recharts, TanStack
   Table) are lazily loaded via `next/dynamic` with `ssr: false` to minimise
   initial bundle size.

### 2.3 Development Workflow

- **Version Control:** Git with GitHub hosting, milestone-based issue tracking.
- **Issue Tracking:** 76 issues across 5 milestones, each linked to commits.
- **Code Quality:** Two custom MCP servers:
  - `thesis-project-manager.py` — milestone tracking, issue management,
    git commit linkage
  - `thesis-code-quality.py` — dead code detection, syntax checking,
    function search, automated test execution
- **Testing Pipeline:** pytest (backend, 593 tests), Jest (frontend unit,
  133 tests), Playwright (E2E, 28 tests)

---

## 3. NLP Feature Extraction

### 3.1 spaCy Pipeline

The `TextAnalyzer` class loads a spaCy English model (`en_core_web_sm`) and
applies a custom pipeline to detect six categories of phishing indicators:

| Category               | Indicators Detected                                  | Example Patterns                                    |
|------------------------|------------------------------------------------------|-----------------------------------------------------|
| **Urgency Patterns**   | Time-pressure language                               | "act now", "expires in 24 hours", "immediately"     |
| **Credential Requests**| Requests for sensitive information                   | "verify your password", "enter your SSN"            |
| **Brand Impersonation**| Mentions of well-known brands in suspicious context  | "PayPal", "Microsoft", "Apple" with action requests |
| **Fear/Threats**       | Threatening language to create panic                  | "account will be suspended", "legal action"         |
| **Suspicious Format**  | Unusual formatting and character use                 | Excessive caps, emoji abuse, mixed character sets    |
| **Emotional Appeals**  | Exploitative emotional language                      | "lottery winner", "charity donation", "inheritance"  |

### 3.2 Scoring

Each detected indicator contributes to the text risk score. The score is
normalised to the range [0, 1]. Multiple indicators of different categories
increase the score more than repeated indicators of the same type, modelling
the observation that diverse phishing signals are stronger evidence of
malicious intent.

---

## 4. OSINT Integration

### 4.1 Data Sources

| Source         | Module              | Data Retrieved                                       |
|----------------|---------------------|------------------------------------------------------|
| **WHOIS**      | `WhoisLookup`       | Domain age, registrar, registration/expiry dates, privacy status |
| **DNS**        | `DnsChecker`        | A, AAAA, MX, NS, TXT, CNAME records; CDN detection  |
| **VirusTotal** | `ReputationChecker` | Multi-vendor malicious detection count               |
| **AbuseIPDB**  | `ReputationChecker` | Abuse confidence score for hosting IP                |

### 4.2 Enrichment Process

1. Extract the domain from the submitted URL or email sender address.
2. Perform an async WHOIS lookup with retry logic and timeout handling.
3. Parse the raw WHOIS response to extract structured data (dates, contacts,
   privacy flags).
4. Resolve DNS records to validate the domain's infrastructure.
5. Query VirusTotal and AbuseIPDB for reputation scores.
6. Aggregate all OSINT data into an `OsintResult` Pydantic model.

### 4.3 Feature Derivation

From the raw OSINT data, the following features are derived:

- **Domain Age Score:** Domains < 30 days old receive maximum risk; score
  decays logarithmically to zero at ~2 years.
- **DNS Validity Score:** Missing A/MX records increase risk; CDN presence
  is a positive signal.
- **Blacklist Score:** Binary flag — any blacklist membership is a strong
  negative signal.
- **Privacy Score:** Private WHOIS registration adds moderate risk.
- **Reputation Score:** Normalised aggregate from VirusTotal and AbuseIPDB.

---

## 5. Scoring Architecture

### 5.1 ML-Primary Approach

Rather than a simple weighted average of heuristic scores, the system uses a
trained XGBoost classifier as the primary scoring engine. The model was trained
on 23,374 labelled URLs with 21 features and optimized via Optuna (50 trials,
5-fold cross-validation).

### 5.2 Mathematical Formulation

**URL Analysis (ML-primary):**

$$S_{url} = w_{ml} \cdot P_{xgb}(\mathbf{x}) + w_{nlp} \cdot S_{text}$$

Where:
- $P_{xgb}(\mathbf{x}) \in [0, 1]$ — XGBoost phishing probability for feature vector $\mathbf{x}$
- $S_{text} \in [0, 1]$ — NLP text analysis score
- $w_{ml} = 0.85$, $w_{nlp} = 0.15$

**Text Analysis (NLP-primary, when no URL is present):**

$$S_{text} = w_{t} \cdot S_{nlp} + w_{u} \cdot S_{url} + w_{o} \cdot S_{osint}$$

Where:
- $w_{t} = 0.55$, $w_{u} = 0.25$, $w_{o} = 0.20$

### 5.3 Feature Vector

The 21-dimensional feature vector $\mathbf{x}$ consists of:

| # | Feature | Type | Source |
|---|---------|------|--------|
| 1–17 | URL structural features | int/float/bool | URL parser |
| 18 | `hasValidMx` | bool | DNS (MX records) |
| 19 | `usesCdn` | bool | DNS (CNAME/NS) |
| 20 | `dnsRecordCount` | int | DNS (all types) |
| 21 | `hasValidDns` | bool | DNS (A records) |

### 5.4 Hyperparameters (Optuna-optimized)

| Parameter | Value |
|-----------|-------|
| `max_depth` | 7 |
| `learning_rate` | 0.177 |
| `n_estimators` | 700 |
| `subsample` | 0.945 |
| `colsample_bytree` | 0.873 |
| `min_child_weight` | 1 |
| `gamma` | 0.198 |
| `reg_alpha` | 0.0003 |
| `reg_lambda` | 0.397 |

### 5.5 Threat-Level Classification

| Threat Level  | Score Range  | Description                                          |
|---------------|--------------|------------------------------------------------------|
| **Safe**       | 0.00 – 0.29 | No significant phishing indicators detected          |
| **Suspicious** | 0.30 – 0.49 | Some indicators present; exercise caution             |
| **Dangerous**  | 0.50 – 0.69 | Strong phishing indicators; avoid interaction         |
| **Critical**   | 0.70 – 1.00 | Confirmed phishing threat; immediate action required  |

---

## 6. Frontend Architecture

### 6.1 Component Hierarchy

```
RootLayout
├── ThemeProvider (next-themes)
├── ResultsProvider (analysis context)
├── KeyboardShortcutsProvider
└── AppLayout
    ├── AppSidebar (navigation, branding)
    ├── AppHeader (health status, theme toggle)
    └── Main Content
        ├── DashboardPage (/)
        ├── AnalyzePage (/analyze)
        │   ├── InputModeSelector (URL/Email/Text)
        │   ├── ContentInput (adaptive form)
        │   └── AnalysisProgress (step animation)
        ├── BatchAnalyzePage (/analyze/batch)
        │   ├── BatchInput (multi-URL textarea + file upload)
        │   └── BatchResults (summary + table + export)
        ├── ResultsPage (/results)
        │   ├── VerdictBanner (animated score + threat level)
        │   ├── ReasonsList (indicator cards)
        │   ├── OsintCards (6 intelligence cards)
        │   ├── FeatureCards (extraction summary)
        │   ├── ScoreBreakdown (donut chart)
        │   ├── ThreatGauge (radial gauge)
        │   └── ConfidenceBar (horizontal bar)
        ├── HistoryPage (/history)
        │   └── HistoryTable (sortable, filterable, paginated)
        ├── HowItWorksPage (/how-it-works)
        │   ├── PipelineDiagram (interactive)
        │   └── Methodology Accordions
        └── SettingsPage (/settings)
            ├── API Configuration
            ├── Display Preferences
            └── History Management
```

### 6.2 State Management

| Store              | Mechanism       | Purpose                                      |
|--------------------|-----------------|----------------------------------------------|
| `ResultsContext`   | React Context   | Cross-page analysis result sharing            |
| `historyStore`     | localStorage    | Persistent analysis history (max 100 entries) |
| `settingsStore`    | localStorage    | User preferences (API URL, theme, detail)     |
| `useHealth`        | Polling hook    | Backend health status (30s interval)          |

### 6.3 Key Features

- **10 routes** with file-based App Router
- **Dark/light/system** theme support with persistence
- **Keyboard shortcuts** (/, Ctrl+Enter, Ctrl+H, ?, Escape, etc.)
- **Responsive design** with mobile bottom navigation
- **Batch analysis** for up to 50 URLs with parallel processing
- **Export** history to CSV/JSON
- **Accessibility** with ARIA labels, skip links, and focus management
- **Custom SVG branding** (logo, favicon, PWA icons)

---

## 7. Preliminary Results

### 7.1 Test Coverage

| Test Layer         | Framework     | Test Count | Status    |
|--------------------|---------------|------------|-----------|
| Backend Unit       | pytest        | 593        | Passing |
| Frontend Unit      | Jest + RTL    | 133        | Passing |
| Frontend E2E       | Playwright    | 28         | Passing |
| **Total**          |               | **754**    | All Pass|

### 7.2 Backend Test Breakdown

| Module           | Test Files | Test Functions | Coverage Areas                         |
|------------------|------------|----------------|----------------------------------------|
| API Router       | 2          | ~80            | All 9 endpoints, validation, errors    |
| Feature Extractor| 1          | ~50            | URL parsing, pattern detection         |
| Scorer           | 1          | ~45            | Weight calculation, risk levels        |
| URL Analyzer     | 1          | ~40            | Structural analysis, brand detection   |
| WHOIS Lookup     | 1          | ~60            | Domain queries, retry logic, parsing   |
| DNS Checker      | 1          | ~55            | Record resolution, CDN detection       |
| Reputation       | 1          | ~50            | VirusTotal, AbuseIPDB integration      |
| NLP Analyzer     | 1          | ~50            | spaCy pipeline, indicator detection    |
| Config           | 1          | ~30            | Settings, environment handling         |
| Schemas          | 3          | ~45            | Pydantic model validation              |
| History Store    | 1          | ~28            | CRUD, pagination, FIFO eviction        |
| Integration      | 5          | ~60            | Full pipeline, cross-module flows      |

### 7.3 Frontend Test Coverage

**Unit Tests (128 across 10 suites):**
- API client and endpoints (fetch mocking, error handling)
- Error classes (NetworkError, ValidationError, ApiError)
- History and settings localStorage stores
- Component rendering (VerdictBanner, OsintCards, FeatureCards)
- Constants validation
- Toast notification helpers

**E2E Tests (28 across 11 suites):**
- URL analysis flow (safe + dangerous verdicts)
- Email analysis flow (with/without optional fields)
- Navigation (sidebar links, dashboard CTAs)
- History (view, delete entries)
- Theme toggle (switching + persistence)
- Settings (about info, API connection, preferences, reset)
- Error handling (unreachable backend, validation)
- Responsive design (mobile viewport)
- Keyboard navigation (tab focus, form submission)
- Empty states (history, results)

### 7.4 Performance Metrics

| Metric                        | Value          | Notes                          |
|-------------------------------|----------------|--------------------------------|
| Backend test suite runtime    | ~150 seconds   | 593 tests, sequential          |
| Frontend unit test runtime    | ~5 seconds     | 128 tests, parallel            |
| Frontend E2E test runtime     | ~45 seconds    | 28 tests, 4 workers            |
| Frontend build time           | ~8 seconds     | 10 routes, static generation   |
| Frontend bundle (compressed)  | Optimised      | Dynamic imports for charts     |

### 7.5 Code Metrics

| Metric                   | Count  |
|--------------------------|--------|
| Backend source files     | 30     |
| Frontend source files    | 94     |
| Backend lines of code    | 12,084 |
| Frontend lines of code   | 10,078 |
| Test code lines          | 9,700  |
| Backend modules          | 4 (api, ml, osint, analyzer) |
| Frontend routes          | 10     |
| API endpoints            | 11     |
| GitHub issues (closed)   | 76     |
| Git commits              | 85+    |

---

## 8. ML Model Evaluation Results

### 8.1 Model Performance

The XGBoost classifier was trained on 23,374 samples and evaluated on a
held-out test set of 5,009 samples:

| Metric | Train | Validation | Test |
|--------|-------|------------|------|
| Accuracy | 98.14% | 96.41% | **96.45%** |
| Precision | 99.22% | 97.51% | **97.86%** |
| Recall | 97.04% | 95.25% | **94.97%** |
| F1-Score | 98.12% | 96.37% | **96.39%** |
| ROC-AUC | 99.88% | 99.50% | **99.41%** |

### 8.2 Dataset

- **Total feature-engineered URLs:** 150,391
- **Training set:** 23,374 samples (70%)
- **Validation set:** 5,009 samples (15%)
- **Test set:** 5,009 samples (15%)
- **Phishing sources:** PhishTank verified entries
- **Legitimate sources:** Tranco Top Sites + synthetic path augmentation

### 8.3 Hyperparameter Optimization

- **Framework:** Optuna (Bayesian optimization)
- **Trials:** 50
- **Cross-validation:** 5-fold stratified
- **Best trial:** #43 (AUC = 0.9943)
- **Training time:** 222.5 seconds

### 8.4 OSINT Feature Contribution

4 OSINT features were included in the final model (out of 12 candidates):
- `hasValidMx`, `usesCdn`, `dnsRecordCount`, `hasValidDns`
- 8 features were dropped due to zero variance in the training data
  (e.g., `domainAgeDays`, `reputationScore`, `isKnownMalicious`)

### 8.5 Model Explainability

SHAP (SHapley Additive exPlanations) TreeExplainer is used to provide
per-prediction feature importance. The top contributing features are:
- `urlLength`, `hasIpAddress`, `digitRatio`, `pathDepth`, `specialCharCount`

### 8.6 Deployment Architecture

| Service | Platform | Region |
|---------|----------|--------|
| Frontend | Vercel (Edge) | Auto |
| Backend API | Render.com (Free tier) | Frankfurt |

- **Live Frontend:** https://project-4soy4.vercel.app
- **Live Backend:** https://phishguard-api-upl2.onrender.com

---

*Updated for Milestone 5 completion — March 2026*
