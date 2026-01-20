#!/usr/bin/env python3
import zipfile
import re

z = zipfile.ZipFile('templates/rdonx.docx')
content = z.read('word/document.xml').decode('utf-8')

# Procurar por "Número:" e ver a estrutura ao redor
label = 'Número:'
idx = content.find(label)

if idx != -1:
    section = content[idx-200:idx+2000]
    print("=" * 80)
    print(f"ESTRUTURA AO REDOR DE '{label}'")
    print("=" * 80)
    print(section)
    print()
    
    # Contar células após o label
    after_label = content[idx:idx+1500]
    cells = re.findall(r'<w:tc[^>]*>', after_label)
    print(f"\nCélulas encontradas após '{label}': {len(cells)}")
    
    # Procurar parágrafos vazios
    empty_p = re.findall(r'<w:p [^>]*\/>', after_label)
    print(f"Parágrafos vazios: {len(empty_p)}")
    
    if empty_p:
        print("\nPrimeiro parágrafo vazio:")
        print(empty_p[0])
