# PhishGuard User Journey Map

This document outlines the user interaction flow with the PhishGuard application, detailing the step-by-step experience and system responses.

## 1. Arrival (Landing Page)
**Action:** The user navigates to `https://project-4soy4.vercel.app` or `http://localhost:3000`.
**Experience:** The user is greeted by a clean, professional dashboard designed with Tailwind CSS and Next.js. The interface immediately presents a prominent input field prompting the user to "Analyze a URL, Email, or Text snippet".
**Value Add:** The design is minimalistic, prioritizing the core functionality without overwhelming the user with complex cybersecurity jargon.

## 2. Input Submission
**Action:** The user pastes a suspicious string into the input box.
- *Scenario A:* A raw URL (e.g., `https://paypal-verify-account.tk/login`)
- *Scenario B:* A raw block of text or an email body.
**Experience:** The frontend JavaScript intercepts the submission. If the input is empty, a subtle toast notification prompts the user. The application sends a `POST` request to the FastAPI backend orchestrator.

## 3. Asynchronous Analysis (The "Loading" State)
**Action:** The backend processes the request.
**Experience:** The user sees a visual loading indicator (e.g., a spinner or skeleton loader) with contextual text ("Gathering Threat Intelligence...").
**Backend Processes:**
- The system automatically detects the content type (`_detectContentType`).
- The NLP module scans for urgency and credential harvesting keywords.
- Concurrently, the OSINT module queries WHOIS, DNS, and reputation databases with a strict 15.0-second timeout.
- The 21-dimensional feature vector is passed to the XGBoost classifier.

## 4. Verdict Presentation (The Results Dashboard)
**Action:** The backend returns the aggregated JSON response, and the frontend transitions to the `/results` route.
**Experience:** The user is presented with a color-coded threat level banner:
- 🟢 **Safe** (< 30% risk)
- 🟡 **Suspicious** (30% - 50% risk)
- 🟠 **Dangerous** (50% - 70% risk)
- 🔴 **Critical** (> 70% risk)

**Key UI Elements:**
- **Confidence Score:** A large percentage dial (e.g., "94% Phishing Probability").
- **Explainable AI (XAI) Reasons:** A bulleted list of the top heuristic factors driving the score (e.g., "Uses IP address instead of a domain name," "Newly registered domain").
- **OSINT Summary Cards:** Clean, readable cards showing Domain Age, Privacy Protection status, and Blacklist presence.

## 5. Reviewing History
**Action:** The user navigates to the "History" tab.
**Experience:** Because the application utilizes an ephemeral, privacy-first local storage implementation (`historyStore.ts`), the user can review past scans without creating an account. The history view displays a tabular summary of previously analyzed URLs, their verdict, and the date scanned.

## 6. System Settings & API Checks
**Action:** The user navigates to the "Settings" route.
**Experience:** Advanced users can toggle theme preferences (Dark/Light mode) and verify the connection status to the FastAPI backend (pinging the `/api/health` endpoint). If the backend is offline, the UI clearly reflects a "Disconnected" state, managing user expectations.