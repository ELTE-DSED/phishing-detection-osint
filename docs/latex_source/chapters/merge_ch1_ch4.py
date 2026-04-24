import sys

ch1_file = 'docs/latex_source/chapters/chapter_01.tex'
ch4_file = 'docs/latex_source/chapters/chapter_04.tex'
output_file = 'docs/latex_source/chapters/chapter_01_merged.tex'

with open(ch1_file, 'r') as f:
    ch1_lines = f.readlines()

with open(ch4_file, 'r') as f:
    ch4_lines = f.readlines()

# Find Thesis Structure section
thesis_struct_idx = -1
for i, line in enumerate(ch1_lines):
    if r'\section{Thesis Structure}' in line:
        thesis_struct_idx = i
        break

# Extract Ch4 content starting from \section{Phishing Attack Landscape}
ch4_start_idx = -1
for i, line in enumerate(ch4_lines):
    if r'\section{Phishing Attack Landscape}' in line:
        ch4_start_idx = i
        break

if thesis_struct_idx != -1 and ch4_start_idx != -1:
    ch4_content = [
        "\\section{Background and Related Work}\n",
        "\\label{chapter-2-background-and-related-work}\n\n"
    ]
    # We should demote sections in ch4 to subsections, and subsections to subsubsections so they fit under "Background and Related Work"
    for line in ch4_lines[ch4_start_idx:]:
        if line.startswith(r'\section{'):
            line = line.replace(r'\section{', r'\subsection{')
        elif line.startswith(r'\subsection{'):
            line = line.replace(r'\subsection{', r'\subsubsection{')
        elif line.startswith(r'\subsubsection{'):
            line = line.replace(r'\subsubsection{', r'\paragraph{')
        ch4_content.append(line)
        
    merged = ch1_lines[:thesis_struct_idx] + ch4_content + ["\n"] + ch1_lines[thesis_struct_idx:]
    
    with open(output_file, 'w') as f:
        f.writelines(merged)
    print("Merge successful")
else:
    print("Could not find markers")
