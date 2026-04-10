# PhishGuard Architecture Diagrams

This directory contains the authoritative, updated Mermaid.js diagrams for the PhishGuard project, perfectly aligned with the final thesis architecture and codebase implementation.

## Available Diagrams

1. **[System Architecture](system-architecture.mmd)**: High-level overview of the Next.js frontend, FastAPI backend, ML scoring engine, and external OSINT APIs.
2. **[User Journey](user-journey.mmd)**: Visualizes how a user interacts with the system from input submission to reviewing the SHAP-explained results.
3. **[Sequence Diagram](sequence-diagram.mmd)**: Details the request/response lifecycle, specifically highlighting the parallel execution of NLP, structural feature extraction, and the strict 15.0s OSINT timeout.
4. **[ML Pipeline](ml-pipeline.mmd)**: Details the flow of raw data into the 21-dimensional feature vector, through the XGBoost classifier, and into the final 85/15 weighted scoring engine.
5. **[Class Diagram](class-diagram.mmd)**: Outlines the core Pydantic schemas and data models used across the backend.

## Viewing these Diagrams

These files (`.mmd`) are natively supported by:
- **GitHub**: Simply view them in the GitHub UI and they will render automatically.
- **VS Code**: Use the `Mermaid Preview` extension.
- **Markdown Docs**: Embed them in any standard markdown file using the \`\`\`mermaid code block syntax.
