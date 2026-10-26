"""Read-only checks of the exported Excel package and its cached model results."""
import json,pathlib,zipfile,xml.etree.ElementTree as E
R=pathlib.Path(__file__).resolve().parents[1]
p=R/'outputs/msft-model/Microsoft_Five_Year_Model.xlsx'
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','c':'http://schemas.openxmlformats.org/drawingml/2006/chart','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with zipfile.ZipFile(p) as z:
    sheets={n:E.fromstring(z.read(n)) for n in z.namelist() if n.startswith('xl/worksheets/sheet') and n.endswith('.xml')}
    errors=[(n,c.get('r')) for n,t in sheets.items() for c in t.findall('.//s:c',ns) if c.get('t')=='e']
    assert not errors,errors
    formulas=sum(len(t.findall('.//s:f',ns)) for t in sheets.values())
    def cached(sheet,cell):
        return float(sheets[f'xl/worksheets/sheet{sheet}.xml'].find(f'.//s:c[@r="{cell}"]/s:v',ns).text)
    report=json.loads((R/'outputs/msft-model/verification.json').read_text())
    assert abs(cached(7,'D36')-report['baseFairValue'])<1e-7
    assert abs(cached(7,'I48')-cached(7,'D36'))<.01
    assert abs(cached(9,'I23'))<.01
    data_tables=[f.attrib for t in sheets.values() for f in t.findall('.//s:f',ns) if f.get('t')=='dataTable']
    assert len(data_tables)==1 and data_tables[0]['r1']=='D18' and data_tables[0]['r2']=='D17'
    charts=[n for n in z.namelist() if '/charts/' in n and n.endswith('.xml')]
    assert len(charts)==1
    chart=E.fromstring(z.read(charts[0])); series=chart.findall('.//c:ser',ns)
    assert len(series)==2
    colors=[n.get('val') for n in chart.findall('.//a:srgbClr',ns)]
    assert '193B5A' in colors and 'D48326' in colors,colors
    assert len(sheets)==10
    assert all(t.find('s:sheetViews/s:sheetView',ns).get('showGridLines') in ['0','false'] for t in sheets.values())
    assert len(sheets['xl/worksheets/sheet2.xml'].findall('.//s:dataValidation',ns))==5
    result={'worksheets':len(sheets),'formulas':formulas,'native_data_tables':data_tables,'chart_series':len(series),'formula_errors':errors,'fair_value_per_share':cached(7,'D36'),'sensitivity_low':cached(7,'G50'),'sensitivity_high':cached(7,'K46'),'cached_values_match_verified_model':True}
    (R/'outputs/msft-model/saved_file_verification.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(result,indent=2))
