#!/usr/bin/env python3
import zipfile
import re

template_path = 'backend/templates/relatoriogastosercamp.docx'

with zipfile.ZipFile(template_path, 'r') as zip_file:
    doc_xml = zip_file.read('word/document.xml').decode('utf-8')
    
    # Find the COMPROVANTES table
    marker = 'COMPROVANTES DE GASTOS'
    marker_pos = doc_xml.find(marker)
    
    if marker_pos == -1:
        print("Marker not found!")
        exit(1)
    
    # Find table start (search backwards)
    tbl_start = -1
    for i in range(marker_pos, max(0, marker_pos - 2000), -1):
        if doc_xml[i:i+7] == '<w:tbl>':
            tbl_start = i
            break
    
    if tbl_start == -1:
        print("Table start not found!")
        exit(1)
    
    # Find table end
    tbl_end = doc_xml.find('</w:tbl>', tbl_start)
    if tbl_end == -1:
        print("Table end not found!")
        exit(1)
    
    table_content = doc_xml[tbl_start:tbl_end + 8]
    
    # Find all rows
    rows = re.findall(r'<w:tr[^>]*>[\s\S]*?</w:tr>', table_content)
    
    print(f"Found {len(rows)} rows in table\n")
    
    for i, row in enumerate(rows):
        tc_open = len(re.findall(r'<w:tc[^>]*>', row))
        tc_close = len(re.findall(r'</w:tc>', row))
        tr_open = len(re.findall(r'<w:tr[^>]*>', row))
        tr_close = len(re.findall(r'</w:tr>', row))
        
        print(f"Row {i}:")
        print(f"  <w:tr>: {tr_open} open, {tr_close} close")
        print(f"  <w:tc>: {tc_open} open, {tc_close} close")
        
        if tc_open != tc_close:
            print(f"  ⚠️ MISMATCH!")
            
            # Show first 200 chars
            print(f"  First 200 chars: {row[:200]}")
            print(f"  Last 200 chars: {row[-200:]}")
        print()
