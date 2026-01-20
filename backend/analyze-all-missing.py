#!/usr/bin/env python3
"""
Analyze ALL missing fields from the image
"""
import zipfile
import re

def analyze_all_missing(template_file, output_file):
    """Analyze all missing fields"""
    
    z_output = zipfile.ZipFile(output_file)
    content = z_output.read('word/document.xml').decode('utf-8')
    
    print('='*80)
    print('ANALYZING ALL MISSING FIELDS FROM IMAGE')
    print('='*80)
    
    # 1. Liberação section - the big field after OBS and Início
    print('\n1️⃣ LIBERAÇÃO SECTION - Big field (Cell 5)')
    liberacao_pos = content.find('Liberação de horas extras:')
    if liberacao_pos != -1:
        row_start = content.rfind('<w:tr', 0, liberacao_pos)
        row_end = content.find('</w:tr>', liberacao_pos)
        row = content[row_start:row_end+7]
        
        cells = re.findall(r'<w:tc[^>]*>[\s\S]*?</w:tc>', row)
        print(f'   Total cells: {len(cells)}')
        
        if len(cells) >= 6:
            # Cell 5 should be the big field
            texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', cells[5])
            text = ''.join(texts)
            
            if text:
                print(f'   ✅ Cell 5 has content: "{text[:50]}"')
            else:
                print(f'   ❌ Cell 5 is EMPTY (this is the big field)')
    
    # 2. Horas trabalhadas - Início and Término columns
    print('\n2️⃣ HORAS TRABALHADAS - Início and Término columns')
    
    labels = [
        'Horas trabalhadas no cliente:',
        'Horário de almoço:',
        'Horas de jantar:',
        'Horas a disposição:',
        'Horas Totais a Trabalhadas:'
    ]
    
    for label in labels:
        pos = content.find(label)
        if pos != -1:
            row_start = content.rfind('<w:tr', 0, pos)
            row_end = content.find('</w:tr>', pos)
            row = content[row_start:row_end+7]
            
            cells = re.findall(r'<w:tc[^>]*>[\s\S]*?</w:tc>', row)
            
            # Check cells 1 and 2 (Início and Término)
            cell1_text = ''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>', cells[1])) if len(cells) > 1 else ''
            cell2_text = ''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>', cells[2])) if len(cells) > 2 else ''
            
            status1 = '✅' if cell1_text else '❌ EMPTY'
            status2 = '✅' if cell2_text else '❌ EMPTY'
            
            print(f'   {label[:30]}...')
            print(f'      Cell 1 (Início): {status1}')
            print(f'      Cell 2 (Término): {status2}')
    
    # 3. Total row in horas disponibilizadas
    print('\n3️⃣ TOTAL ROW in Horas Disponibilizadas')
    
    # Find the Total: row after horas disponibilizadas section
    hd_pos = content.find('INFORMAÇÃO DE HORAS DISPONIBILIZADAS:')
    if hd_pos != -1:
        section = content[hd_pos:hd_pos+6000]
        
        # Find last "Total:" in this section
        total_positions = []
        search_pos = 0
        while True:
            pos = section.find('Total:', search_pos)
            if pos == -1:
                break
            total_positions.append(pos)
            search_pos = pos + 1
        
        if total_positions:
            last_total_pos = total_positions[-1]
            absolute_pos = hd_pos + last_total_pos
            
            # Get the row
            row_start = content.rfind('<w:tr', 0, absolute_pos)
            row_end = content.find('</w:tr>', absolute_pos)
            row = content[row_start:row_end+7]
            
            cells = re.findall(r'<w:tc[^>]*>[\s\S]*?</w:tc>', row)
            print(f'   Total cells: {len(cells)}')
            
            # Check cell 3 (Total column)
            if len(cells) > 3:
                texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', cells[3])
                text = ''.join(texts)
                
                if text:
                    print(f'   ✅ Cell 3 (Total): "{text}"')
                else:
                    print(f'   ❌ Cell 3 (Total): EMPTY')
    
    # 4. Final signature lines
    print('\n4️⃣ FINAL SIGNATURE LINES')
    
    nx_pos = content.find('Nós NX Energy')
    if nx_pos != -1:
        # Get section around signatures
        section = content[nx_pos:nx_pos+2000]
        
        # Look for dashed lines or underscores
        if '___' in section:
            print('   ✅ Underscores found')
        elif '---' in section:
            print('   ✅ Dashes found')
        else:
            print('   ❌ No dashed lines found')
        
        # Check if there are empty cells for signatures
        row_start = content.rfind('<w:tr', 0, nx_pos)
        row_end = content.find('</w:tr>', nx_pos)
        
        if row_start != -1 and row_end != -1:
            row = content[row_start:row_end+7]
            cells = re.findall(r'<w:tc[^>]*>[\s\S]*?</w:tc>', row)
            
            print(f'   Signature row has {len(cells)} cells')

if __name__ == '__main__':
    analyze_all_missing('templates/rdonx.docx', 'test-rdo-output.docx')
