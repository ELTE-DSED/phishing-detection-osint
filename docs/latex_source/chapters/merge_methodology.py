import os

files = [
    'docs/latex_source/chapters/chapter_05.tex',
    'docs/latex_source/chapters/chapter_06.tex',
    'docs/latex_source/chapters/chapter_07.tex'
]
output_file = 'docs/latex_source/chapters/chapter_04_new.tex'

with open(output_file, 'w') as out:
    # Read Ch5
    with open(files[0], 'r') as f:
        ch5_lines = f.readlines()
        
    for i, line in enumerate(ch5_lines):
        if line.startswith(r'\chapter{'):
            out.write(r'\chapter{Methodology: Feature Engineering, OSINT, and NLP}' + '\n')
            # skip the next line if it's the rest of a multiline chapter, but it's single line here
        elif line.startswith('Feature Engineering and ML Model}'):
            pass # skip
        else:
            out.write(line)
            
    out.write('\n\n')
    
    # Read Ch6
    with open(files[1], 'r') as f:
        ch6_lines = f.readlines()
        
    start_idx = 0
    for i, line in enumerate(ch6_lines):
        if line.startswith(r'\section{'):
            start_idx = i
            break
            
    for line in ch6_lines[start_idx:]:
        out.write(line)
        
    out.write('\n\n')
    
    # Read Ch7
    with open(files[2], 'r') as f:
        ch7_lines = f.readlines()
        
    start_idx = 0
    for i, line in enumerate(ch7_lines):
        if line.startswith(r'\section{'):
            start_idx = i
            break
            
    for line in ch7_lines[start_idx:]:
        out.write(line)
        
print("Methodology merge successful")
