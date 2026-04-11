import re

with open('chapters/chapter_08.tex', 'r', encoding='utf-8') as f:
    ch8 = f.read()

# Grab sections safely
def extract_section(start_str, end_str=None):
    if end_str:
        pattern = re.compile(rf'({start_str}.*?)(?={end_str})', re.DOTALL)
    else:
        pattern = re.compile(rf'({start_str}.*)', re.DOTALL)
    m = pattern.search(ch8)
    if m:
        return m.group(1).strip()
    return f"ERROR EXTRACTING: {start_str}"

part_backend = extract_section(r'\\section\{System Architecture', r'\\section\{Frontend Implementation\}')
part_frontend = extract_section(r'\\section\{Frontend Implementation\}', r'\\section\{Deployment and')
part_deploy = extract_section(r'\\section\{Deployment and', r'\\section\{Integration and')
part_integration = extract_section(r'\\section\{Integration and Weighting', r'\\section\{Introduction to the Quality')
part_qa = extract_section(r'\\section\{Introduction to the Quality')

print("Backend size:", len(part_backend))
print("Frontend size:", len(part_frontend))
print("Deploy size:", len(part_deploy))
print("Integration size:", len(part_integration))
print("QA size:", len(part_qa))
