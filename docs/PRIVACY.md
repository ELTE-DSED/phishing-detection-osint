# PhishGuard Privacy Policy

**Effective Date:** 2026-04-10

## 1. Information Collection and Use

### 1.1 Ephemeral Data Processing
The PhishGuard platform operates entirely on an **ephemeral analysis model**. We do not permanently store, log, or database the specific URLs, email bodies, or text snippets submitted by users to our API orchestrator.

When you submit content to `https://phishguard-api-upl2.onrender.com` or `http://localhost:8000`:
- The payload is held in volatile memory only for the duration of the analysis (maximum 15 seconds).
- The text is parsed by our spaCy NLP model and the URL is structurally decomposed into a 21-dimensional feature vector.
- Once the XGBoost classifier generates a risk probability and returns the JSON payload to the client, the original content is discarded from the backend memory pool.

### 1.2 Local Storage (Frontend History)
Your analysis history is stored strictly on your local machine. The Next.js frontend utilizes browser `localStorage` (`historyStore.ts`) to retain past scan results.
- **You** retain complete control over this data.
- **We** do not possess an account system, cloud database, or remote backup of your scan history.
- You can clear this history at any time by clearing your browser data or using the "Clear History" function in the application settings.

## 2. Third-Party Integrations and Data Sharing

To provide comprehensive Open-Source Intelligence (OSINT), PhishGuard securely transmits the **extracted domain name** (e.g., `suspicious-login.tk`) to trusted third-party threat intelligence providers:

- **VirusTotal (Google Chronicle)**
- **AbuseIPDB**

**Important Context:**
- We *only* transmit the bare domain or IP address to these services to query their reputation databases.
- We **never** transmit the full URL path, query parameters, or the contents of email bodies to these external providers, ensuring that sensitive session tokens, passwords, or personal identifiers inadvertently included in your submission remain entirely private.

## 3. Cookies and Tracking
The PhishGuard application uses minimal, functional cookies (specifically `next-themes` and React state management) to preserve your UI preferences (e.g., Dark Mode vs. Light Mode) and local session state. We do not integrate with third-party advertising trackers or analytics platforms (e.g., Google Analytics, Facebook Pixel).

## 4. Open Source and Transparency
The entire PhishGuard architecture—both the FastAPI backend and Next.js frontend—is open source. You are encouraged to audit the source code repository to verify these privacy claims. If you require absolute privacy for highly sensitive internal communications, you are explicitly encouraged to clone the repository and run the entire stack locally on your own hardware, isolated from the public internet.

## 5. Contact Information
If you have any questions regarding this Privacy Policy or the data handling practices of the PhishGuard architecture, please contact:
**Ishaq Muhammad**
pxprgk@inf.elte.hu