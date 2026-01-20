#!/usr/bin/env python3
"""
Debug activities section in detail
"""
import zipfile
import re

def debug_activities(filename):
    """Debug activities section"""
    z = zipfile.ZipFile(filename)
    content = z.read('word/document.xml').decode('utf-8')
    
    print('='*80)
    print('DEBUGGING ACTIVITIES SECTION')
    print('='*80)
    
    # Find the activities section
    desc_label = 'Descrição: 1) Atividades Realizadas, 2) Progresso (cronograma),'
    desc_pos = content.find(desc_label)
    
    if desc_pos == -1:
        print('❌ Description label not found')
        return
    
    print(f'\n✅ Description label found at position {desc_pos}')
    
    # Find the row end
    row_end = content.find('</w:tr>', desc_pos)
    print(f'✅ Row ends at position {row_end}')
    
    # Find next row (where activities should be)
    next_row_start = content.find('<w:tr', row_end)
    next_row_end = content.find('</w:tr>', next_row_start)
    
    if next_row_start == -1:
        print('❌ Next row not found')
        return
    
    print(f'✅ Next row: {next_row_start} to {next_row_end}')
    
    # Extract the row
    row_content = content[next_row_start:next_row_end + 7]
    
    # Find all cells
    cells = re.findall(r'<w:tc[^>]*>[\s\S]*?</w:tc>', row_content)
    print(f'\n📊 Row has {len(cells)} cells')
    
    # Extract text from each cell
    for i, cell in enumerate(cells):
        texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', cell)
        text_content = ''.join(texts)
        
        print(f'\n  Cell {i}:')
        print(f'    Text: "{text_content[:100]}"')
        
        # Check if has <w:r> (run with text)
        has_run = '<w:r>' in cell
        print(f'    Has <w:r>: {has_run}')
        
        if i == 1 and len(text_content) > 0:
            print(f'\n✅ ACTIVITIES FOUND IN CELL 1:')
            print(f'{text_content}')

if __name__ == '__main__':
    debug_activities('test-rdo-output.docx')
