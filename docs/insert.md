# 📖 PhishGuard Thesis: Image Screenshot Checklist

I have already injected all 5 Mermaid diagrams directly into your `THESIS_COMPLETE_DOCUMENT.md`! You do not need to touch the `.mmd` files or paste any code. 

**However, because I am an AI, I physically cannot browse the internet or take screenshots of your computer monitor. You must complete these final 2 tasks before creating your PDF:**

---

## 📸 1. The 2 Final Image Placeholders to Replace

I scanned your 19,500-word thesis. There are exactly **two** `[FIGURE...]` placeholders left that require you to take an image and paste it. 

### A. Phishing Attack Taxonomy (Internet Search)
- **Find this in the document:** `**[FIGURE 2-1: Phishing Attack Taxonomy Diagram]**` (Around Line 408)
- **What to do:** 
  1. Google search for "Phishing Taxonomy Tree Diagram" (showing branches like Email, SMS, Spear Phishing).
  2. Save the image to your `docs/assets/` folder and name it `taxonomy.png`.
  3. Replace the `**[FIGURE 2-1...]**` text in your document with this markdown link:
     `![Figure 2.1: Phishing Attack Taxonomy](assets/taxonomy.png)`

### B. SHAP Feature Importance Plot (Take a Screenshot)
- **Find this in the document:** `**[FIGURE 4-1: SHAP Feature Importance (Beeswarm Plot)]**` (Around Line 1133)
- **What to do:** 
  1. Open your PhishGuard app, scan a URL, and open the "Feature Details" or SHAP graph that your backend generates.
  2. Take a screenshot of that graph.
  3. Save the image to your `docs/assets/` folder and name it `shap_plot.png`.
  4. Replace the `**[FIGURE 4-1...]**` text in your document with this markdown link:
     `![Figure 4.1: SHAP Feature Importance (Beeswarm Plot)](assets/shap_plot.png)`

---

## 🏆 2. Convert to PDF!

That is it! Once you download that one taxonomy image and take that one screenshot of your SHAP graph, your entire thesis is done.

**How to Convert:**
1. Make sure your `taxonomy.png` and `shap_plot.png` are sitting in the `docs/assets/` folder.
2. Open `docs/THESIS_COMPLETE_DOCUMENT.md` in VS Code.
3. Right-click anywhere in the file and select **"Markdown PDF: Export (pdf)"** (Make sure you have the Markdown PDF extension installed).
4. The converter will automatically draw the Mermaid diagrams and paste your 2 screenshots into the final, beautiful PDF!
