#!/usr/bin/env python3
"""
Debug activities row - show actual XML
"""
import zipfile
import re

def debug_activities_xml(filename):
    """Show actual XML of activities row"""
    z = zipfile.ZipFile(filename)
    content = z.read('word/document.xml').decode('utf-8')
    
    print('='*80)
    print('ACTIVITIES ROW - ACTUAL XML')
    print('='*80)
    
    # Find the activities section
    desc_label = 'Descrição: 1) Atividades Realizadas, 2) Progresso (cronograma),'
    desc_pos = content.find(desc_label)
    
    if desc_pos == -1:
        print('❌ Description label not found')
        return
    
    # Find the row end
    row_end = content.find('</w:tr>', desc_pos)
    
    # Find next row (where activities should be)
    next_row_start = content.find('<w:tr', row_end)
    next_row_end = content.find('</w:tr>', next_row_start)
    
    # Extract the row
    row_content = content[next_row_start:next_row_end + 7]
    
    # Find cell 1 (second cell)
    cells = re.findall(r'<w:tc[^>]*>[\s\S]*?</w:tc>', row_content)
    
    if len(cells) >= 2:
        cell1 = cells[1]
        
        print('\n📄 CELL 1 CONTENT (first 1000 chars):')
        print(cell1[:1000])
        
        print('\n\n📄 CELL 1 CONTENT (next 1000 chars):')
        print(cell1[1000:2000])
        
        # Check for our injected text
        if 'Inspeção visual' in cell1:
            print('\n✅ Activities text found in cell!')
        else:
            print('\n❌ Activities text NOT found in cell')
        
        # Check for Poppins font
        if 'Poppins' in cell1:
            print('✅ Poppins font found')
        else:
            print('❌ Poppins font NOT found')

if __name__ == '__main__':
    debug_activities_xml('test-rdo-output.docx')
