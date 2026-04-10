# 📖 PhishGuard Thesis: Where to Insert Your Diagrams

This is your master guide to replacing **every single placeholder** in your final thesis document (`docs/THESIS_COMPLETE_DOCUMENT.md`). If you follow this checklist, there will be **zero leftovers** and you will not be embarrassed.

---

## 🔍 The Exact 4 Placeholders to Replace

I scanned your entire thesis document. There are exactly four `[FIGURE...]` placeholders. Here is exactly how to replace each one:

### 1. Phishing Attack Taxonomy
- **Find this in document:** `**[FIGURE 2-1: Phishing Attack Taxonomy Diagram]**` (Around Line 408)
- **What to do:** Delete this text. You should paste a screenshot or image of a tree diagram showing phishing types (Email, SMS, Spear Phishing). Put the image in your `assets` folder and use this code:
  `![Figure 2.1: Phishing Attack Taxonomy](assets/taxonomy.png)`

### 2. OSINT Data Collection Pipeline
- **Find this in document:** `**[FIGURE 2-2: OSINT Data Collection and Feature Engineering Pipeline]**` (Around Line 818)
- **What to do:** Delete this text and paste the Mermaid code from `docs/diagrams/mermaid/ml-pipeline.mmd`:
  ```mermaid
  (paste the code from ml-pipeline.mmd here)
  ```

### 3. High-Level System Data Flow
- **Find this in document:** `**[FIGURE 3-1: High-Level System Data Flow]**` (Around Line 956)
- **What to do:** Delete this text and the 3 bullet points below it. Paste the Mermaid code from `docs/diagrams/mermaid/system-architecture.mmd`:
  ```mermaid
  (paste the code from system-architecture.mmd here)
  ```

### 4. SHAP Feature Importance Plot
- **Find this in document:** `**[FIGURE 4-1: SHAP Feature Importance (Beeswarm Plot)]**` (Around Line 1133)
- **What to do:** Delete this text. You need to take a screenshot of the actual SHAP graph your Python backend generates. Save it to the `assets` folder and use this code:
  `![Figure 4.1: SHAP Feature Importance (Beeswarm Plot)](assets/shap_plot.png)`

---

## ➕ Where to add the extra diagrams (For maximum grades)

To make your thesis look even better, add the remaining 3 Mermaid diagrams we created in the following places:

1. **The Sequence Diagram (Request Lifecycle)**
   - **Where:** Chapter 3, under section **3.2.2 Asynchronous OSINT Orchestration**
   - **How:** Paste the code from `sequence-diagram.mmd` inside a \`\`\`mermaid block.

2. **Class Diagram (Data Models)**
   - **Where:** Chapter 3, under section **3.3.3 Pydantic Schema Contracts**
   - **How:** Paste the code from `class-diagram.mmd` inside a \`\`\`mermaid block.

3. **User Journey Diagram**
   - **Where:** Chapter 6, under the introduction to **Chapter 6: User Interface and Experience**
   - **How:** Paste the code from `user-journey.mmd` inside a \`\`\`mermaid block.

---

## 📸 How to Insert Images vs. Diagrams (Your Question Answered)

**1. For the Mermaid Diagrams (`.mmd` files we just made):**
You **DO NOT** use links or the assets folder! You literally copy the text code from the file and paste it directly into your thesis document inside a code block, like this:
\`\`\`mermaid
graph TD
  A --> B
\`\`\`
When you convert the `.md` file to a `.pdf`, the PDF converter reads that text and draws the diagram for you automatically!

**2. For Screenshots and Photos (PNGs/JPGs):**
You **MUST** save the image file into your `docs/assets/` folder. Then, you write this in your markdown:
`![Description of Image](assets/my_screenshot.png)`
**Yes**, the image file MUST be inside the `assets` folder on your computer at the exact moment you click "Convert to PDF". If the asset file is missing, the PDF will just show a broken link.
