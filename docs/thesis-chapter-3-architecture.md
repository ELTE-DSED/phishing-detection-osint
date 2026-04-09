# Chapter 3: System Design and Architecture

## 3.1 Architectural Overview

The PhishGuard platform is engineered as a modern, decoupled, full-stack web application. The architectural design prioritizes low-latency inference, modular separation of concerns, and a seamless user experience. To achieve these objectives, the system adopts a client-server architecture, cleanly separating the user interface and presentation logic from the heavy computational requirements of the machine learning and Open-Source Intelligence (OSINT) pipelines.

The overarching architecture is composed of two primary subsystems:
1.  **The Client-Side Application (Frontend):** A responsive web interface built with Next.js 16 and React 19. It is responsible for accepting user input, rendering complex analytical visualizations, and managing client-side state.
2.  **The Analytical Engine (Backend):** A high-performance, asynchronous REST API constructed using the FastAPI framework in Python. It orchestrates the Natural Language Processing (NLP) pipeline, executes asynchronous network OSINT queries, performs feature engineering, and serves the XGBoost machine learning model.

This separation of concerns ensures that computationally expensive operations—such as executing concurrent DNS queries and traversing gradient-boosted decision trees—do not block the main thread of the user interface, thereby guaranteeing a fluid and responsive user experience even under heavy analytical load.

---

## 3.2 High-Level Data Flow

The operational lifecycle of a threat analysis request within the PhishGuard architecture follows a deterministic, multi-stage pipeline. The data flow is designed to dynamically adapt based on the modality of the input (URL, email, or unstructured text).

**[FIGURE 3-1: High-Level System Data Flow]**
*Description: A sequence diagram illustrating the lifecycle of an analysis request.*
*How to create:*
1. Use a diagramming tool (e.g., draw.io or Lucidchart).
2. Create a sequence diagram illustrating the following flow:
   - **User Input:** The user submits text/URL via the Next.js Frontend.
   - **API Request:** The Frontend issues an HTTP POST request to the FastAPI `/api/analyze` endpoint.
   - **Router/Orchestrator:** The backend `orchestrator.py` receives the payload and determines the input modality.
   - **Parallel Processing:** For a URL, the Orchestrator concurrently triggers the `featureExtractor.py` (for lexical analysis) and the OSINT modules (`dnsChecker.py`, `whoisLookup.py`, `reputationChecker.py`).
   - **Inference:** The extracted features are aggregated and passed to the XGBoost Model.
   - **Response Generation:** The backend synthesizes a JSON response containing the threat score and OSINT findings.
   - **Visualization:** The Next.js Frontend parses the JSON and dynamically renders the results.
3. Export the diagram as a high-resolution PNG (300 DPI) and insert it here.

### 3.2.1 Input Modality Detection

Upon receiving a payload from the client via the `/api/analyze` endpoint, the backend orchestrator first subjects the input to a heuristic classification layer to determine its fundamental nature. The `_detectContentType` method in `orchestrator.py` utilizes rigorous regular expressions and parsing logic to classify the input into one of three categories:
-   **URL:** Detected if the string begins with protocol identifiers (`http://`, `https://`) or matches a strict bare-domain regular expression pattern (e.g., `google.com`).
-   **Email:** Detected if the text block contains standard RFC 5322 email headers, specifically checking for the presence of substrings such as "from:", "subject:", and "to:".
-   **Free Text:** Any unstructured text that fails to meet the strict criteria of a URL or email header defaults to generic text analysis.

This dynamic, "auto" detection allows the user to paste any suspicious content into a single, unified input field without needing to manually specify the content type, significantly reducing user friction. Once the modality is determined, the `_extractDomain` method leverages `urllib.parse` and custom regex to isolate the base domain, which is a prerequisite for subsequent OSINT lookups.

### 3.2.2 Asynchronous OSINT Orchestration

The integration of real-time OSINT constitutes the primary bottleneck in the analysis pipeline. Querying global DNS servers, establishing WHOIS connections, and communicating with third-party threat intelligence APIs introduce unavoidable network latency. 

To mitigate this, the FastAPI backend heavily leverages Python's `asyncio` ecosystem. Within the `_collectOsintData` method, the system does not execute these external queries sequentially. Instead, it utilizes `asyncio.gather` to concurrently execute `lookupWhois(domain)`, `lookupDns(domain)`, and `lookupReputation(domain)`. 

Crucially, this parallel execution is wrapped in an `asyncio.wait_for` block with a strict global timeout of 15.0 seconds. This architectural safeguard ensures that unresponsive external servers or rate-limited third-party APIs do not cause the internal event loop to hang indefinitely. The system is designed to fail gracefully; if an OSINT query times out or returns an exception, the orchestrator catches it, logs the failure, and proceeds with the analysis utilizing the available subset of data (or falling back to pure ML/NLP heuristics).

---

## 3.3 The API and Scoring Engine

### 3.3.1 Weighted Verdict Combination

The core intelligence of the system resides in how the `AnalysisOrchestrator` synthesizes disparate analytical signals into a singular, actionable verdict. Because the system supports multi-modal inputs, the scoring logic must dynamically adjust the mathematical weight of each component based on the input type.

The `_combineVerdict` method implements the following weighting algorithm:

**For URL Inputs:**
When the input is a URL, the XGBoost model is treated as the supreme authority because its training data implicitly encoded both lexical and OSINT features.
-   **Machine Learning (XGBoost):** 85% (`ML_PRIMARY_WEIGHT`)
-   **NLP Text Analysis:** 15% (`TEXT_SUPPLEMENT_WEIGHT`)

**For Email/Text Inputs:**
When analyzing raw text or emails, the raw lexical URL features become secondary to the semantic meaning of the content.
-   **NLP Text Analysis:** 55% (`TEXT_PRIMARY_WEIGHT`)
-   **URL Lexical Features (Extracted from text):** 25% (`URL_SECONDARY_WEIGHT`)
-   **OSINT Infrastructure Score:** 20% (`OSINT_SECONDARY_WEIGHT`)

The resulting aggregate score is bounded between 0.0 and 1.0. This score is then mapped to definitive threat levels:
-   **Safe:** Score < 0.3 (`THREAT_SAFE_UPPER`)
-   **Suspicious:** Score < 0.5 (`THREAT_SUSPICIOUS_UPPER`)
-   **Dangerous:** Score < 0.7 (`THREAT_DANGEROUS_UPPER`)
-   **Critical:** Score $\ge$ 0.7

This tiered approach allows the frontend to render appropriate visual warnings and dynamic recommendations (e.g., "Do not click links or provide information" for 'Dangerous' classifications).

### 3.3.2 Ephemeral History Store

Consistent with the project's scope as a lightweight, deployable prototype, PhishGuard eschews the architectural complexity of a persistent relational database (e.g., PostgreSQL or MySQL). Instead, the backend implements a highly efficient, thread-safe, in-memory `HistoryStore` located in `backend/api/historyStore.py`.

The module utilizes a standard Python `collections.deque` structured as a First-In-First-Out (FIFO) queue with a hard limit of 100 entries (`MAX_ENTRIES`). When a user submits an analysis, the backend generates a unique UUID, stores the full `AnalysisResponse` object in the deque, and assigns a precise timestamp. 

Because FastAPI operates on a single primary event loop, concurrent asynchronous mutations to this deque are fundamentally thread-safe without requiring complex locking mechanisms (like `asyncio.Lock`). This design allows users to review their recent analysis history via paginated API calls instantly, without the latency, scaling, or configuration overhead of a persistent database connection.

### 3.3.3 Pydantic Schema Contracts

To guarantee structural integrity between the Next.js frontend and the FastAPI backend, PhishGuard utilizes Pydantic models to define strict data contracts. Every incoming request and outgoing response is automatically validated, serialized, and documented via OpenAPI.

For example, the core `AnalysisResponse` schema mathematically guarantees that the frontend will always receive a deterministic JSON object. This object contains the `VerdictResult` (including the boolean `isPhishing` flag and float `confidenceScore`), the `OsintSummary`, and the `FeatureSummary`. This strict validation eliminates runtime `TypeError` and `KeyError` exceptions in the frontend UI, providing a robust, self-documenting API contract.

---

## 3.4 Frontend Architecture

The presentation layer is constructed using Next.js 16 (App Router) and React 19, focusing heavily on performance, modern UI/UX paradigms, and data visualization.

### 3.4.1 Component-Based Structure
The user interface is strictly modular, adhering to React's component-based philosophy. The architecture leverages the `shadcn/ui` component library alongside `@base-ui/react` to provide accessible, highly customizable foundational components (e.g., buttons, input fields, modals). 

The application logic is separated into logical directories:
-   `src/app`: Contains the Next.js App Router logic, global layouts, and top-level page components (such as the analyzer dashboard and history views).
-   `src/components`: Houses reusable UI elements. Complex visual representations, such as risk gauges or metric cards, are isolated here.

### 3.4.2 State Management and Client-Server Interaction
State management within the application is handled primarily through React's native hooks (`useState`, `useEffect`). The application consciously avoids heavyweight global state managers (like Redux or Zustand) in favor of localized, prop-drilled state where appropriate. This architectural choice aligns with the modern Next.js paradigm, which encourages keeping state as close to the UI components as possible to minimize unnecessary re-renders.

Communication with the FastAPI backend is achieved via native `fetch` requests. The application utilizes the `sonner` library to provide non-blocking, toast-based notification feedback to the user regarding the success or failure of network requests, ensuring the user is always aware of the system's status during the 1-3 seconds required for OSINT queries.

### 3.4.3 Visual Presentation and Theming
A critical requirement of the system was the delivery of a professional, "dark-mode" optimized aesthetic typical of modern cybersecurity platforms. The application achieves this via `tailwindcss` (version 4) for utility-first styling and `next-themes` for seamless theme switching. 

The visual hierarchy utilizes distinct color coding to rapidly communicate the threat levels computed by the backend orchestrator: green for 'Safe', amber for 'Suspicious', and red for critical 'Phishing' indicators. Fluid animations and layout transitions, powered by the `motion` library, are employed to provide immediate visual feedback during the analysis lifecycle, elegantly bridging the perceived latency gap during external network lookups.

---

## 3.5 Summary

This chapter detailed the structural engineering of the PhishGuard platform. The architecture successfully isolates the Next.js presentation layer from the FastAPI analytical engine. By employing an asynchronous concurrency model in Python (`asyncio.gather` with global timeouts) and an in-memory `deque` for history management, the system achieves the necessary performance metrics required for real-time threat analysis. Furthermore, the orchestrator's dynamic weighting algorithms ensure accurate assessments across diverse input modalities.

The subsequent chapter, Chapter 4, will delve deeply into the mathematical core of this architecture: the feature engineering pipeline, the XGBoost classification model, and the Optuna optimization strategy.

---

**End of Chapter 3**