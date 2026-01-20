#!/usr/bin/env python3
"""
Check if RDO output has all fields filled correctly
"""
import zipfile
import re

def check_rdo_output(filename):
    """Check RDO output for filled fields"""
    z = zipfile.ZipFile(filename)
    content = z.read('word/document.xml').decode('utf-8')
    
    print('='*80)
    print('CHECKING RDO OUTPUT')
    print('='*80)
    
    # Extract all text content
    texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', content)
    full_text = ''.join(texts)
    
    print('\n📋 BASIC FIELDS:')
    checks = [
        ('OS Number', 'OS-2024-001'),
        ('Date', '2024-01-20'),
        ('Project', 'Manutenção Preventiva'),
        ('Client', 'Cliente Teste LTDA'),
        ('City', 'São Paulo/SP'),
        ('Substation', 'SE Teste 138kV'),
    ]
    
    for label, value in checks:
        if value in full_text:
            print(f'  ✅ {label}: {value}')
        else:
            print(f'  ❌ {label}: NOT FOUND')
    
    print('\n👥 TEAM MEMBERS:')
    team_members = ['João Silva', 'Maria Santos', 'Pedro Oliveira']
    for member in team_members:
        if member in full_text:
            print(f'  ✅ {member}')
        else:
            print(f'  ❌ {member}: NOT FOUND')
    
    print('\n⏰ WORK HOURS:')
    hours_checks = [
        ('Início normal', '08:00'),
        ('Término normal', '17:00'),
        ('Deslocamento início', '06:00'),
        ('Deslocamento término', '08:00'),
        ('Deslocamento total', '2:00'),
        ('Horas trabalhadas', '8:00'),
        ('Almoço', '1:00'),
        ('Total trabalhadas', '12:00'),
    ]
    
    for label, value in hours_checks:
        if value in full_text:
            print(f'  ✅ {label}: {value}')
        else:
            print(f'  ❌ {label}: NOT FOUND')
    
    print('\n⏳ AVAILABLE HOURS:')
    if '09:00' in full_text:
        print(f'  ✅ Integração término: 09:00')
    else:
        print(f'  ❌ Integração término: NOT FOUND')
    
    print('\n📋 ACTIVITIES:')
    activities = [
        'Inspeção visual geral',
        'Medição de resistência',
        'Limpeza de buchas',
        'Verificação de nível'
    ]
    
    for activity in activities:
        if activity in full_text:
            print(f'  ✅ {activity}')
        else:
            print(f'  ❌ {activity}: NOT FOUND')
    
    print('\n✍️ SIGNATURES:')
    if 'José Cliente' in full_text:
        print(f'  ✅ Client representative: José Cliente')
    else:
        print(f'  ❌ Client representative: NOT FOUND')
    
    print('\n📝 OBSERVATIONS:')
    if 'Equipamento em boas condições' in full_text:
        print(f'  ✅ Observations found')
    else:
        print(f'  ❌ Observations: NOT FOUND')
    
    print('\n' + '='*80)
    print('CHECKING CHECKBOXES')
    print('='*80)
    
    # Count checked vs unchecked
    checked = content.count('☒')
    unchecked = content.count('☐')
    
    print(f'\n☒ Checked: {checked}')
    print(f'☐ Unchecked: {unchecked}')
    
    # Check if "Não" checkbox is marked
    liberacao_pos = content.find('Liberação de horas extras')
    if liberacao_pos != -1:
        section = content[liberacao_pos:liberacao_pos+1000]
        if '☒' in section:
            print(f'\n✅ Liberação de horas extras checkbox is marked')
        else:
            print(f'\n❌ Liberação de horas extras checkbox NOT marked')

if __name__ == '__main__':
    check_rdo_output('test-rdo-output.docx')
