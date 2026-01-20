#!/usr/bin/env python3
"""
Analyze missing fields in RDO template
"""
import zipfile
import re

def analyze_missing_fields(template_file, output_file):
    """Compare template with output to find missing fields"""
    
    print('='*80)
    print('ANALYZING MISSING FIELDS')
    print('='*80)
    
    # Read template
    z_template = zipfile.ZipFile(template_file)
    template_content = z_template.read('word/document.xml').decode('utf-8')
    
    # Read output
    z_output = zipfile.ZipFile(output_file)
    output_content = z_output.read('word/document.xml').decode('utf-8')
    
    print('\n🔍 Checking "Assinatura" field after Representante CLIENTE...')
    
    # Find Representante CLIENTE section
    cliente_pos = output_content.find('Representante CLIENTE')
    if cliente_pos != -1:
        section = output_content[cliente_pos:cliente_pos+2000]
        
        # Count cells after "Representante CLIENTE"
        row_start = output_content.rfind('<w:tr', 0, cliente_pos)
        row_end = output_content.find('</w:tr>', cliente_pos)
        row = output_content[row_start:row_end+7]
        
        cells = re.findall(r'<w:tc[^>]*>[\s\S]*?</w:tc>', row)
        print(f'  Found {len(cells)} cells in Representante CLIENTE row')
        
        for i, cell in enumerate(cells):
            texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', cell)
            text = ''.join(texts)
            print(f'  Cell {i}: "{text[:50]}"')
    
    print('\n🔍 Checking OBS field in liberação section...')
    liberacao_pos = output_content.find('Liberação de horas extras')
    if liberacao_pos != -1:
        section = output_content[liberacao_pos:liberacao_pos+3000]
        
        if 'OBS' in section:
            print('  ✅ OBS label found')
            
            # Find OBS cell
            obs_pos = section.find('OBS')
            if obs_pos != -1:
                # Find the cell after OBS
                after_obs = section[obs_pos:]
                cell_end = after_obs.find('</w:tc>')
                next_cell_start = after_obs.find('<w:tc', cell_end)
                next_cell_end = after_obs.find('</w:tc>', next_cell_start)
                
                if next_cell_start != -1:
                    obs_cell = after_obs[next_cell_start:next_cell_end+7]
                    texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', obs_cell)
                    text = ''.join(texts)
                    
                    if text:
                        print(f'  ✅ OBS cell has content: "{text[:50]}"')
                    else:
                        print(f'  ❌ OBS cell is EMPTY')
        else:
            print('  ❌ OBS label NOT found')
    
    print('\n🔍 Checking work hours rows for Término and Total columns...')
    
    hours_labels = [
        'Horas trabalhadas no cliente:',
        'Horário de almoço:',
        'Horas de jantar:',
        'Horas a disposição:',
        'Horas Totais a Trabalhadas:'
    ]
    
    for label in hours_labels:
        pos = output_content.find(label)
        if pos != -1:
            row_start = output_content.rfind('<w:tr', 0, pos)
            row_end = output_content.find('</w:tr>', pos)
            row = output_content[row_start:row_end+7]
            
            cells = re.findall(r'<w:tc[^>]*>[\s\S]*?</w:tc>', row)
            
            print(f'\n  {label}')
            print(f'    Total cells: {len(cells)}')
            
            for i in range(min(4, len(cells))):
                texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', cells[i])
                text = ''.join(texts)
                
                if i == 0:
                    print(f'    Cell {i} (Label): "{text[:30]}"')
                elif i == 1:
                    if text:
                        print(f'    Cell {i} (Início): ✅ "{text}"')
                    else:
                        print(f'    Cell {i} (Início): ❌ EMPTY')
                elif i == 2:
                    if text:
                        print(f'    Cell {i} (Término): ✅ "{text}"')
                    else:
                        print(f'    Cell {i} (Término): ❌ EMPTY')
                elif i == 3:
                    if text:
                        print(f'    Cell {i} (Total): ✅ "{text}"')
                    else:
                        print(f'    Cell {i} (Total): ❌ EMPTY')
    
    print('\n🔍 Checking horas disponibilizadas rows...')
    
    hd_labels = [
        'Falta de recursos para execução das atividades',
        'Condições climáticas inapropriadas:',
        'Retomada de atividades',
        'Outros (especifique)'
    ]
    
    for label in hd_labels:
        pos = output_content.find(label)
        if pos != -1:
            row_start = output_content.rfind('<w:tr', 0, pos)
            row_end = output_content.find('</w:tr>', pos)
            row = output_content[row_start:row_end+7]
            
            cells = re.findall(r'<w:tc[^>]*>[\s\S]*?</w:tc>', row)
            
            print(f'\n  {label[:40]}...')
            print(f'    Total cells: {len(cells)}')
            
            for i in range(1, min(4, len(cells))):
                texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', cells[i])
                text = ''.join(texts)
                
                if i == 1:
                    status = '✅' if text else '❌ EMPTY'
                    print(f'    Cell {i} (Início): {status}')
                elif i == 2:
                    status = '✅' if text else '❌ EMPTY'
                    print(f'    Cell {i} (Término): {status}')
                elif i == 3:
                    status = '✅' if text else '❌ EMPTY'
                    print(f'    Cell {i} (Total): {status}')
    
    print('\n🔍 Checking final signature lines...')
    
    nx_pos = output_content.find('Nós NX Energy')
    if nx_pos != -1:
        section = output_content[nx_pos:nx_pos+2000]
        
        # Look for dashed lines (underscores or specific formatting)
        if '___' in section or '---' in section:
            print('  ✅ Dashed lines found')
        else:
            print('  ❌ Dashed lines NOT found')

if __name__ == '__main__':
    analyze_missing_fields('templates/rdonx.docx', 'test-rdo-output.docx')
