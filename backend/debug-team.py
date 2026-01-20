#!/usr/bin/env python3
import zipfile
import re

z = zipfile.ZipFile('templates/rdonx.docx')
content = z.read('word/document.xml').decode('utf-8')

# Procurar pela tabela de equipe
label = 'Equipe de trabalho'
idx = content.find(label)

if idx != -1:
    print("=" * 80)
    print("ESTRUTURA DA TABELA DE EQUIPE")
    print("=" * 80)
    
    # Encontrar a tabela
    tblStart = content.rfind('<w:tbl>', 0, idx)
    tblEnd = content.find('</w:tbl>', idx)
    
    table = content[tblStart:tblEnd + 8]
    
    # Contar linhas
    rows = re.findall(r'<w:tr[^>]*>.*?</w:tr>', table, re.DOTALL)
    print(f"\nLinhas encontradas: {len(rows)}")
    
    if len(rows) >= 2:
        print("\n" + "=" * 80)
        print("LINHA 1 (Header):")
        print("=" * 80)
        print(rows[0][:500])
        
        print("\n" + "=" * 80)
        print("LINHA 2 (Template para dados):")
        print("=" * 80)
        print(rows[1][:800])
