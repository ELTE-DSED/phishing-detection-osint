# 📖 PhishGuard Thesis: Where to Insert Your Diagrams

This is your master guide for replacing all the placeholder texts (like `[FIGURE X-X]`) in your final thesis document (`docs/THESIS_COMPLETE_DOCUMENT.md`) with the beautiful, highly-accurate diagrams and screenshots we just created.

By following this guide, you will have a perfectly formatted, academically rigorous thesis ready for presentation!

---

## 🛠️ How to Insert the Mermaid Diagrams

The diagrams we created are written in **Mermaid.js**. Most modern markdown editors (like GitHub, VS Code, Notion) and modern LaTeX setups natively support Mermaid. 

To insert them into your `THESIS_COMPLETE_DOCUMENT.md`, you just need to copy the code from the files in `docs/diagrams/mermaid/` and paste them inside a markdown code block like this:

```markdown
\```mermaid
(paste the code here)
\```
```

---

## 📍 Exact Insertion Points in Your Thesis

### 1. System Architecture (High-Level Data Flow)
- **Where to put it:** Chapter 3, under section **3.2 High-Level Data Flow** (Around line 956, replace the text `[FIGURE 3-1: High-Level System Data Flow]`)
- **What to insert:** Use the code from `docs/diagrams/mermaid/system-architecture.mmd`.
- **Caption:** *Figure 3.1: High-Level Architecture separating the Next.js Presentation layer, FastAPI Application Orchestrator, ML Pipeline, and Async OSINT Integrations.*

### 2. The Sequence Diagram (Request Lifecycle)
- **Where to put it:** Chapter 3, under section **3.2.2 Asynchronous OSINT Orchestration** (This is a great place to show the parallel 15.0s timeouts).
- **What to insert:** Use the code from `docs/diagrams/mermaid/sequence-diagram.mmd`.
- **Caption:** *Figure 3.2: Sequence Diagram illustrating parallel execution of Structural Features, NLP Analysis, and the strict 15.0s OSINT timeout.*

### 3. Machine Learning Pipeline
- **Where to put it:** Chapter 4, right at the beginning of **Chapter 4: Feature Engineering and ML Model** (Around line 1065).
- **What to insert:** Use the code from `docs/diagrams/mermaid/ml-pipeline.mmd`.
- **Caption:** *Figure 4.1: The ML Pipeline mapping the extraction of 17 structural and 4 OSINT features, synthesized through XGBoost and weighted against NLP context.*

### 4. Class Diagram (Data Models)
- **Where to put it:** Chapter 3, under section **3.3.3 Pydantic Schema Contracts**.
- **What to insert:** Use the code from `docs/diagrams/mermaid/class-diagram.mmd`.
- **Caption:** *Figure 3.3: UML Class Diagram defining the strict Pydantic data contracts (AnalysisRequest, AnalysisReport, FeatureSet) enforcing backend type safety.*

### 5. User Journey Diagram
- **Where to put it:** Chapter 6, under the introduction to **Chapter 6: User Interface and Experience**.
- **What to insert:** Use the code from `docs/diagrams/mermaid/user-journey.mmd`.
- **Caption:** *Figure 6.1: The End-to-End User Journey, illustrating the transition from input submission to reviewing Explainable AI (SHAP) metrics.*

---

## 📸 Recommended UI Screenshots to Take Manually

Because I am an AI, I cannot take photos of your screen. To make your thesis look incredible, you should take the following screenshots from your running application and insert them as standard images (`![Caption](path/to/image.png)`).

1. **The Dashboard/Input Screen:** Take a clean screenshot of your homepage in Dark Mode.
   - **Insert at:** Chapter 6 (User Interface).
2. **The Threat Gauge & Results:** Paste a known phishing URL (e.g., `http://secure-login-paypal-update.com`) and take a screenshot of the big circular threat gauge showing "Dangerous" or "Critical".
   - **Insert at:** Chapter 7 (Scoring and Classification) or Chapter 6.
3. **SHAP Explanations:** On the results page, expand the "Feature Details" or "Why did we give this score?" section and screenshot the human-readable explanations.
   - **Insert at:** Chapter 10 (Results and Explainability). This is **CRUCIAL** for proving your Explainable AI claims!
4. **The History Table:** Take a screenshot of the History dashboard showing a mix of safe and malicious recent scans.
   - **Insert at:** Chapter 3 (Under 3.3.2 Ephemeral History Store).

---

## 🧹 Final Presentation Checklist

- [ ] Copy the 5 Mermaid codes into `THESIS_COMPLETE_DOCUMENT.md`.
- [ ] Take the 4 UI screenshots mentioned above and paste them in.
- [ ] Search the thesis document for the word `[FIGURE` and make sure you've replaced all of my placeholders.
- [ ] Export to PDF (Use VS Code's "Markdown PDF" extension, or whatever LaTeX/PDF tool your university prefers).

You are 100% ready to present. Good luck!
