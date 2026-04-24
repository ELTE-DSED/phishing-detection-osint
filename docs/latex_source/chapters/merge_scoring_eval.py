import os

files = [
    'docs/latex_source/chapters/chapter_08.tex',
    'docs/latex_source/chapters/chapter_09.tex'
]
output_file = 'docs/latex_source/chapters/chapter_05_new.tex'

with open(output_file, 'w') as out:
    # Read Ch8
    with open(files[0], 'r') as f:
        ch8_lines = f.readlines()
        
    for i, line in enumerate(ch8_lines):
        if line.startswith(r'\chapter{'):
            out.write(r'\chapter{Scoring Engine and Evaluation}' + '\n')
        elif line.startswith('Scoring and Classification}'):
            pass # skip
        else:
            out.write(line)
            
    out.write('\n\n')
    
    # Read Ch9
    with open(files[1], 'r') as f:
        ch9_lines = f.readlines()
        
    start_idx = 0
    for i, line in enumerate(ch9_lines):
        if line.startswith(r'\section{'):
            start_idx = i
            break
            
    for line in ch9_lines[start_idx:]:
        out.write(line)
        
print("Scoring and Eval merge successful")
