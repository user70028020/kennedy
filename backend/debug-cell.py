#!/usr/bin/env python3
import zipfile
import re

z = zipfile.ZipFile('templates/rdonx.docx')
content = z.read('word/document.xml').decode('utf-8')

# Encontrar "Número:" e a próxima célula
label = 'Número:'
labelPos = content.find(label)

if labelPos != -1:
    # Encontrar fim da célula do label
    cellEndPos = content.find('</w:tc>', labelPos)
    
    # Encontrar próxima célula
    nextCellStart = content.find('<w:tc', cellEndPos)
    nextCellEnd = content.find('</w:tc>', nextCellStart)
    
    cellContent = content[nextCellStart:nextCellEnd + 7]
    
    print("=" * 80)
    print("CONTEÚDO DA CÉLULA APÓS 'Número:'")
    print("=" * 80)
    print(cellContent)
    print()
    
    # Procurar parágrafo
    pMatches = re.findall(r'<w:p[^>]*>.*?</w:p>|<w:p[^>]*/>', cellContent, re.DOTALL)
    print(f"\nParágrafos encontrados: {len(pMatches)}")
    for i, p in enumerate(pMatches):
        print(f"\n{i+1}. {p[:200]}...")
