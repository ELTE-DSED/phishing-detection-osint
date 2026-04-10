## Instructions for Figures and Tables

### FIGURE 2-1: Phishing Attack Taxonomy Diagram

**How to create:**
1. Use a diagramming tool (draw.io, Lucidchart, PowerPoint SmartArt, or Python library like `graphviz`)
2. Create a hierarchical tree structure:
   - **Root node:** "Phishing Attacks"
   - **Level 2 branches:**
     - "Attack Vector" → Email, SMS, Voice, Social Media, Web
     - "Targeting Strategy" → Mass, Spear, Whaling
     - "Technical Method" → URL Spoofing, Clone, MITM, Malware
3. Use different colors for each category (e.g., blue for Attack Vector, green for Targeting Strategy, orange for Technical Method)
4. Export as PNG (300 DPI) or vector format (SVG, PDF)

**Caption:**
"Figure 2-1: Hierarchical taxonomy of phishing attacks classified by attack vector, targeting strategy, and technical method. Phishing attacks can employ multiple techniques simultaneously (e.g., spear phishing via email using URL spoofing)."

---

### TABLE 2-1: Types of Phishing Attacks
Already provided in the text. Format as a 4-column table with alternating row shading.

---

### TABLE 2-2: Comparison of Traditional Phishing Detection Methods
Already provided in the text. Use checkmarks (✅) and crosses (❌) for visual clarity.

---

### TABLE 2-3: Machine Learning Algorithms for Phishing Detection - Literature Review
Already provided in the text. Highlight the "This Work (PhishGuard)" row in a different color or bold.

---

### TABLE 2-4: OSINT Data Sources and Their Utility
Already provided in the text. Format as a 4-column table.

---

### TABLE 2-5: Feature Comparison with Existing Solutions
Already provided in the text. Use symbols (✅ Yes, ❌ No, ⚠️ Limited) for visual clarity. Highlight the "PhishGuard" column.

---

### FIGURE 2-2: OSINT Data Collection and Feature Engineering Pipeline

**How to create:**
1. Create a flowchart using draw.io, Lucidchart, or Python (`matplotlib`, `graphviz`)
2. Structure:
   - **Start:** "Input URL"
   - **Step 1:** "Extract Domain"
   - **Parallel Branches:**
     - Branch A: "WHOIS Lookup" → "Parse Registration Date, Registrar, Privacy" → "Domain Age Score"
     - Branch B: "DNS Resolution" → "Query A, MX, NS, CNAME" → "DNS Validity Features"
     - Branch C: "Reputation APIs" → "VirusTotal, AbuseIPDB" → "Reputation Score"
   - **Merge:** All branches merge into "Feature Vector (21 dimensions)"
   - **End:** "XGBoost Classifier" → "Phishing Probability"
3. Use arrows to show data flow
4. Export as high-resolution PNG or vector format

**Caption:**
"Figure 2-2: OSINT data collection and feature engineering pipeline. The input URL undergoes parallel OSINT enrichment (WHOIS, DNS, reputation APIs) to generate OSINT-derived features, which are combined with URL structural features to form the complete 21-dimensional feature vector for ML classification."

---

**Next Chapter:**
Let me know when you're ready, and I'll proceed to **Chapter 3: System Design and Architecture** (8-10 pages).

---

### FIGURE 8-1: Asynchronous Analysis Orchestrator Pipeline

**How to create:**
1. Use a sequence diagram tool (e.g., Mermaid.js, draw.io, or PlantUML).
2. Define the following actors/components:
   - Client (Frontend)
   - Orchestrator (`backend/api/orchestrator.py`)
   - NLP Module
   - OSINT Gatherer (`asyncio.gather` block)
   - ML Predictor (`XGBoost`)
3. Create the following flow:
   - **Client** sends `POST /analyze` to **Orchestrator**.
   - **Orchestrator** concurrently dispatches tasks:
     - `asyncio.create_task` to **NLP Module**.
     - `asyncio.wait_for(asyncio.gather(...), timeout=15.0)` to **OSINT Gatherer** (which further splits into WHOIS, DNS, and Reputation).
   - Show the 15-second timeout boundary enforcing a strict SLA.
   - Once OSINT returns, **Orchestrator** passes `OsintData` and URL to **ML Predictor**.
   - **Orchestrator** awaits all results, applies `_combineVerdict` weighting logic, and returns the final `AnalysisResponse` to the **Client**.
4. Export as a high-resolution PNG or SVG.

**Caption:**
"Figure 8-1: Sequence diagram illustrating the asynchronous execution pipeline within the Analysis Orchestrator. The diagram highlights the concurrent execution of NLP and OSINT gathering tasks, bounded by a strict 15.0-second global timeout to ensure API responsiveness."

---

### FIGURE 9-1: PhishGuard Quality Assurance Architecture

**How to create:**
1. Use a block architecture tool (e.g., Lucidchart, draw.io, or Visio).
2. Create two distinct vertical sections: "Backend Testing" and "Frontend Testing".
3. **Backend Section:**
   - Draw a large box for `pytest`.
   - Inside the box, place three tiers (pyramid style):
     - Bottom (Unit): "Isolated Tests (`tests/unit/`)" pointing to "Mocked OSINT Data (`conftest.py`)".
     - Middle (Integration): "FastAPI TestClient" pointing to "Batch Analysis".
     - Top (Smoke): "SLA Enforcement (< 5.0s, < 1.0s)".
4. **Frontend Section:**
   - Draw a large box for "Next.js QA".
   - Inside the box, place two tiers:
     - Bottom (Component/State): "Jest & React Testing Library" pointing to "State Stores & UI DOM".
     - Top (End-to-End): "Playwright" pointing to "Browser Automation (Simulating User Flow)".
5. Draw a horizontal bar at the very bottom spanning both sections labeled: "Static Analysis (Pyright & TypeScript / ESLint)".
6. Export as a high-resolution PNG or SVG (300 DPI).

**Caption:**
"Figure 9-1: The multi-tiered Quality Assurance architecture of the PhishGuard platform, illustrating the strict separation between backend execution (`pytest` and mocked dependencies) and frontend UI automation (Jest and Playwright), underpinned by rigorous static type checking."

---

### FIGURE 10-1: SHAP Feature Importance (Bar Plot)

**How to create:**
1. Locate the pre-generated `shap_bar.png` within the `data/evaluation/` directory.
2. If the file is unavailable, execute `python -m backend.ml.training.shapAnalysis` to generate it.
3. Ensure the graph explicitly lists the top features by mean |SHAP| value (e.g., `isHttps`, `hasValidDns`, `specialCharCount`, `pathDepth`).

**Caption:**
"Figure 10-1: SHAP feature importance plot illustrating the mean absolute impact of each feature on the model output. The global analysis indicates that `isHttps` and the OSINT-derived `hasValidDns` are the most influential discriminators in the dataset."

---

### TABLE 10-1: Confusion Matrix on Held-Out Test Set

**How to create:**
1. Create a 2x2 table representing the classification results on the 5,009 test samples.
2. Columns: Predicted Legitimate, Predicted Phishing.
3. Rows: Actual Legitimate, Actual Phishing.
4. Data:
   - True Negatives (Actual Legitimate, Predicted Legitimate): 2,453
   - False Positives (Actual Legitimate, Predicted Phishing): 52
   - False Negatives (Actual Phishing, Predicted Legitimate): 126
   - True Positives (Actual Phishing, Predicted Phishing): 2,378

**Caption:**
"Table 10-1: Confusion matrix illustrating the model's classification performance on the 5,009 sample test set. The high true positive and true negative rates underscore the model's accuracy, while the low false positive rate (52) highlights its precision."

---

### TABLE 10-2: OSINT Ablation Study Results

**How to create:**
1. Create a 4-column table comparing the feature subsets.
2. Columns: Metric, Full Model (21 Features), URL Features Only (17 Features), Difference ($\Delta$).
3. Rows (Data from `ablation_report.json`):
   - Accuracy: 98.40%, 98.93%, -0.53%
   - Precision: 99.13%, 99.78%, -0.65%
   - Recall: 97.65%, 98.08%, -0.43%
   - F1-Score: 98.39%, 98.92%, -0.53%

**Caption:**
"Table 10-2: Comparative performance metrics between the full PhishGuard model (URL + OSINT features) and the baseline model utilizing only structural URL features. While OSINT features contribute significantly to heuristic explainability, the baseline structural model achieved nominally higher standalone metrics within this specific dataset."
