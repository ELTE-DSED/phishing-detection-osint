import os
import re

def modify_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Fix Chapter 2 (User Docs) cross-refs
modify_file('docs/latex_source/chapters/chapter_02.tex', [
    ('Figure 8.1', 'Figure 2.1'),
    ('Figure 8.2', 'Figure 2.2')
])

# Fix Chapter 3 (Dev Docs) cross-refs
modify_file('docs/latex_source/chapters/chapter_03.tex', [
    ('Chapter 4', 'Chapter 5'), # the ML chapter is now chapter 5
    ('\\# Chapter 9: Testing and', ''),
    ('Figure 8.1', 'Figure 3.4')
])

# Fix Chapter 4 (Background) cross-refs
modify_file('docs/latex_source/chapters/chapter_04.tex', [
    ('Figure 2.1', 'Figure 4.1'),
    ('Figure 2.2', 'Figure 4.2'),
    ('TABLE 2-', 'TABLE 4-'),
    ('Chapter 3', 'Chapter 5'), # old chapter 3 is now Developer Docs, so old chapter 4 (ML) is the next logical step but we need to fix the text
    ('The next chapter (Chapter 5)', 'The next chapters'), # Safer
    ('References for Chapter 2', 'References for Chapter 4')
])

# Fix Chapter 7 (NLP)
modify_file('docs/latex_source/chapters/chapter_07.tex', [
    ('Chapter 3', 'Chapter 3 (Developer Documentation)')
])

# Fix Chapter 10 (Discussion)
modify_file('docs/latex_source/chapters/chapter_10.tex', [
    ('Chapter 10)', 'Chapter 9)'),
    ('\\# Chapter 12: Conclusion and Future Work', '')
])

print("Cross-references fixed.")
