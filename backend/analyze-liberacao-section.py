#!/usr/bin/env python3
"""
Analyze liberação section structure
"""
import zipfile
import re

def analyze_liberacao(filename):
    """Analyze liberação de horas extras section"""
    z = zipfile.ZipFile(filename)
    content = z.read('word/document.xml').decode('utf-8')
    
    print('='*80)
    print('ANALYZING LIBERAÇÃO SECTION')
    print('='*80)
    
    # Find liberação section
    liberacao_pos = content.find('Liberação de horas extras:')
    if liberacao_pos == -1:
        print('❌ Liberação section not found')
        return
    
    print(f'\n✅ Found at position {liberacao_pos}')
    
    # Get the row containing liberação
    row_start = content.rfind('<w:tr', 0, liberacao_pos)
    row_end = content.find('</w:tr>', liberacao_pos)
    
    if row_start == -1 or row_end == -1:
        print('❌ Row not found')
        return
    
    row = content[row_start:row_end+7]
    
    # Find all cells
    cells = re.findall(r'<w:tc[^>]*>[\s\S]*?</w:tc>', row)
    
    print(f'\n📊 Row has {len(cells)} cells:')
    
    for i, cell in enumerate(cells):
        texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', cell)
        text = ''.join(texts)
        
        print(f'\n  Cell {i}:')
        print(f'    Text: "{text[:80]}"')
        
        # Check if empty
        has_run = '<w:r>' in cell
        print(f'    Has content: {has_run}')
    
    # Look for "Término:" in the section after liberação
    section = content[liberacao_pos:liberacao_pos+3000]
    
    print(f'\n🔍 Looking for fields after liberação...')
    
    if 'Término:' in section:
        print('  ✅ "Término:" found')
        termino_pos = section.find('Término:')
        print(f'     Position: {termino_pos} chars after liberação')
    else:
        print('  ❌ "Término:" NOT found')
    
    if 'Início:' in section:
        print('  ✅ "Início:" found')
        inicio_pos = section.find('Início:')
        print(f'     Position: {inicio_pos} chars after liberação')
    else:
        print('  ❌ "Início:" NOT found')

if __name__ == '__main__':
    analyze_liberacao('templates/rdonx.docx')
