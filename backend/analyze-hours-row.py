#!/usr/bin/env python3
"""
Analyze RDO template to understand the structure of hours rows
"""
import zipfile
import sys

def analyze_hours_section(filename):
    """Analyze the hours section structure"""
    z = zipfile.ZipFile(filename)
    content = z.read('word/document.xml').decode('utf-8')
    
    # Find the hours section
    labels = [
        'Horas de deslocamento:',
        'Horas trabalhadas no cliente:',
        'Horário de almoço:',
        'Integração, Liberação de documentação, permissão de trabalho:'
    ]
    
    for label in labels:
        print(f'\n{"="*80}')
        print(f'ANALYZING: {label}')
        print(f'{"="*80}')
        
        idx = content.find(label)
        if idx == -1:
            print(f'❌ Label not found')
            continue
        
        # Find the row containing this label
        row_start = content.rfind('<w:tr', 0, idx)
        row_end = content.find('</w:tr>', idx)
        
        if row_start == -1 or row_end == -1:
            print(f'❌ Row not found')
            continue
        
        row_content = content[row_start:row_end + 7]
        
        # Count cells in this row
        import re
        cells = re.findall(r'<w:tc[^>]*>[\s\S]*?</w:tc>', row_content)
        
        print(f'\n📊 Row has {len(cells)} cells:')
        
        for i, cell in enumerate(cells):
            # Extract text content
            texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', cell)
            text_content = ''.join(texts)
            
            # Check if cell has empty paragraph
            has_empty_p = bool(re.search(r'<w:p\s+[^>]*\/>', cell))
            has_empty_p2 = bool(re.search(r'<w:p\s+[^>]*>(?:(?!<w:r>).)*?<\/w:p>', cell))
            
            print(f'\n  Cell {i}:')
            print(f'    Text: "{text_content[:50]}"')
            print(f'    Empty paragraph (self-closing): {has_empty_p}')
            print(f'    Empty paragraph (no <w:r>): {has_empty_p2}')
            print(f'    Length: {len(cell)} chars')
            
            # Show first 200 chars of cell
            if i > 0 and (has_empty_p or has_empty_p2):
                print(f'    Preview: {cell[:200]}...')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python analyze-hours-row.py template.docx')
        sys.exit(1)
    
    analyze_hours_section(sys.argv[1])
