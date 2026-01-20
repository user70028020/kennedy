#!/usr/bin/env python3
import zipfile
import re

z = zipfile.ZipFile('templates/rdonx.docx')
content = z.read('word/document.xml').decode('utf-8')

# Procurar pela tabela de equipe
label = 'Equipe de trabalho'
idx = content.find(label)

if idx != -1:
    # Encontrar a tabela
    tblStart = content.rfind('<w:tbl>', 0, idx)
    tblEnd = content.find('</w:tbl>', idx)
    
    table = content[tblStart:tblEnd + 8]
    
    # Contar linhas
    rows = re.findall(r'<w:tr[^>]*>.*?</w:tr>', table, re.DOTALL)
    print(f"Total de linhas: {len(rows)}\n")
    
    # Mostrar estrutura de cada linha
    for i, row in enumerate(rows):
        print("=" * 80)
        print(f"LINHA {i+1}:")
        print("=" * 80)
        
        # Contar células
        cells = re.findall(r'<w:tc[^>]*>.*?</w:tc>', row, re.DOTALL)
        print(f"Células: {len(cells)}")
        
        # Mostrar conteúdo de texto de cada célula
        for j, cell in enumerate(cells):
            texts = re.findall(r'<w:t[^>]*>([^<]*)</w:t>', cell)
            if texts:
                print(f"  Célula {j}: {' '.join(texts)}")
            else:
                # Verificar se tem parágrafo vazio
                if re.search(r'<w:p\s+[^>]*/>', cell):
                    print(f"  Célula {j}: [parágrafo self-closing]")
                elif re.search(r'<w:p\s+[^>]*>(?:(?!<w:r>).)*?</w:p>', cell, re.DOTALL):
                    print(f"  Célula {j}: [parágrafo vazio sem <w:r>]")
                else:
                    print(f"  Célula {j}: [outro formato]")
        print()
