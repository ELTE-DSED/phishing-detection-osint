# PhishGuard API Documentation

PhishGuard is a high-performance, asynchronous phishing detection API powered by XGBoost, spaCy, and multi-source OSINT aggregation.

## Base URL
Production: `https://phishguard-api-upl2.onrender.com`
Local: `http://localhost:8000`

## Endpoints

### 1. Health Check
Checks the status of the API and its internal services.
**Endpoint:** `GET /api/health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-04-10T03:00:00Z",
  "services": {
    "osint": true,
    "ml": true,
    "analyzer": true
  }
}
```

### 2. Auto-Detect Analysis
Automatically detects the content type (URL or Email text) and performs a comprehensive analysis.
**Endpoint:** `POST /api/analyze`

**Request Body:**
```json
{
  "content": "https://suspicious-login.tk/verify",
  "contentType": "auto" 
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "verdict": {
    "isPhishing": true,
    "confidenceScore": 0.87,
    "threatLevel": "dangerous",
    "reasons": [
      "ML model confidence: 87.0%",
      "Domain registered recently (2 days ago)",
      "Uses suspicious top-level domain"
    ],
    "recommendation": "This content has multiple phishing indicators. Do not click links or provide information."
  },
  "osint": {
    "domain": "suspicious-login.tk",
    "domainAgeDays": 2,
    "registrar": "Freenom",
    "isPrivate": true,
    "hasValidDns": true,
    "reputationScore": 0.6,
    "inBlacklists": false
  },
  "features": {
    "urlFeatures": 4,
    "textFeatures": 0,
    "osintFeatures": 2,
    "totalRiskIndicators": 6,
    "detectedTactics": []
  },
  "analysisTime": 1240.5
}
```

### 3. URL-Specific Analysis
Forces the analyzer to treat the payload as a URL.
**Endpoint:** `POST /api/analyze/url`

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

### 4. Email/Text-Specific Analysis
Forces the analyzer to treat the payload as an email or raw text block, utilizing the spaCy NLP pipeline heavily.
**Endpoint:** `POST /api/analyze/email`

**Request Body:**
```json
{
  "content": "URGENT: Your account will be suspended in 24 hours. Click here to verify your identity.",
  "subject": "Account Suspension Notice",
  "sender": "security@paypal-verify-team.com"
}
```
