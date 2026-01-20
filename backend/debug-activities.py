#!/usr/bin/env python3
import zipfile
import re

z = zipfile.ZipFile('templates/rdonx.docx')
content = z.read('word/document.xml').decode('utf-8')

# Procurar pela seção de descrição
label = 'Descrição: 1) Atividades Realizadas, 2) Progresso (cronograma),'
idx = content.find(label)

if idx != -1:
    print("=" * 80)
    print("ESTRUTURA DA SEÇÃO DE ATIVIDADES")
    print("=" * 80)
    
    # Pegar 3000 chars após o label
    section = content[idx:idx+3000]
    
    # Encontrar células
    cells = re.findall(r'<w:tc[^>]*>.*?</w:tc>', section, re.DOTALL)
    print(f"\nCélulas encontradas: {len(cells)}")
    
    if len(cells) >= 2:
        print("\n" + "=" * 80)
        print("SEGUNDA CÉLULA (onde devem ir as atividades):")
        print("=" * 80)
        print(cells[1][:1000])
