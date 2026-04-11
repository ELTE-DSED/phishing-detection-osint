import os
import re

with open('chapters/chapter_08.tex', 'r', encoding='utf-8') as f:
    ch8 = f.read()

def extract_section(start_str, end_str=None):
    if end_str:
        pattern = re.compile(rf'({start_str}.*?)(?={end_str})', re.DOTALL)
    else:
        pattern = re.compile(rf'({start_str}.*)', re.DOTALL)
    m = pattern.search(ch8)
    return m.group(1).strip() if m else ""

part_backend = extract_section(r'\\section\{System Architecture', r'\\section\{Frontend Implementation\}')
part_frontend = extract_section(r'\\section\{Frontend Implementation\}', r'\\section\{Deployment and')
part_deploy = extract_section(r'\\section\{Deployment and', r'\\section\{Integration and')
part_integration = extract_section(r'\\section\{Integration and Weighting', r'\\section\{Introduction to the Quality')
part_qa = extract_section(r'\\section\{Introduction to the Quality')

# Chapter 3 old
with open('chapters/chapter_03.tex', 'r', encoding='utf-8') as f:
    ch3 = f.read()
ch3_cleaned = re.sub(r'\\chapter\{.*?\}', '', ch3, count=1).strip()

user_doc_content = f"""\\chapter{{User Documentation}}
\\label{{user-documentation}}

\\section{{Problem Statement}}
The problem addressed by this application is the rapid detection and explanation of phishing attacks. Users need a simple interface to submit suspicious URLs, emails, or text snippets, and receive an immediate, understandable threat analysis report. This protects end-users and organizations from malicious social engineering campaigns.

\\section{{Methods Used}}
The application utilizes a hybrid Machine Learning (ML), Open Source Intelligence (OSINT), and Natural Language Processing (NLP) architecture to classify the input. It compares the given input against known global threat databases and runs mathematical feature models to predict malicious intent. The underlying mechanisms and architecture are detailed in the Developer Documentation and subsequent chapters.

\\section{{User Guide and Interface}}
{part_frontend}
"""

dev_doc_content = f"""\\chapter{{Developer Documentation}}
\\label{{developer-documentation}}

\\section{{Detailed Problem Specification}}
The software engineering task involves developing a scalable, high-concurrency threat intelligence platform capable of ingesting diverse modalities (URL, email, text), orchestrating asynchronous analysis pipelines (DNS, WHOIS, NLP, Reputation), executing an ML inference engine, and returning a deterministically weighted threat score and explanation within strict latency constraints.

\\section{{Logical and Physical Structure}}
\\subsection{{The Tech Stack}}
The physical architecture of PhishGuard is built upon a modern, distributed full-stack paradigm:
\\begin{{itemize}}
    \\item \\textbf{{Frontend (Vercel):}} The user interface is implemented using Next.js (React) and TypeScript, deployed globally on Vercel's Edge Network for optimal performance and CDN caching.
    \\item \\textbf{{Backend (Render):}} The analysis engine and REST API are built with Python FastAPI, containerized via Docker, and deployed on Render to handle CPU-intensive ML inferences and asynchronous I/O operations.
    \\item \\textbf{{Version Control (GitHub):}} The entire source code, issue tracking, and CI/CD pipelines are managed via GitHub repositories.
\\end{{itemize}}

{ch3_cleaned}

{part_backend}

{part_deploy}

{part_integration}

\\section{{Testing Plan and Results}}
{part_qa}
"""

# Store old chapters
chapters = {}
for i in range(1, 11):
    with open(f"chapters/chapter_{i:02d}.tex", 'r', encoding='utf-8') as f:
        chapters[i] = f.read()

# New mapping
new_chapters = {
    1: chapters[1], # Intro
    2: user_doc_content, # NEW User Doc
    3: dev_doc_content, # NEW Dev Doc (merges old 3 & old 8)
    4: chapters[2], # Background
    5: chapters[4], # ML Model
    6: chapters[5], # OSINT
    7: chapters[6], # NLP
    8: chapters[7], # Scoring
    9: chapters[9], # Results
    10: chapters[10] # Discussion
}

for i in range(1, 11):
    with open(f"chapters/chapter_{i:02d}.tex", 'w', encoding='utf-8') as f:
        f.write(new_chapters[i])
