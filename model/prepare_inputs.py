import csv,json,pathlib,re
R=pathlib.Path(__file__).resolve().parents[1]
rows=list(csv.DictReader((R/'data/processed/historical_statements.csv').open(encoding='utf-8-sig')))
def val(kind,year,label,context=None):
    x=[r for r in rows if r['statement']==kind and int(r['fiscal_year'])==year and r['metric'].startswith(label) and (context is None or r['context']==context)]
    if not x and label=='Equity and other investments': return val(kind,year,'Equity investments',context)
    exact=[r for r in x if r['metric']==label]
    if exact: x=exact
    if len(x)!=1: raise ValueError((kind,year,label,len(x)))
    return float(x[0]['value'])
def note(year,signature,label,context=None):
    for report in range(2026,max(2021,year)-1,-1):
        doc=json.loads((R/f'data/processed/ar{report}_tables.json').read_text(encoding='utf-8'))
        for table in doc['tables']:
            if not any(row and row[0]==signature for row in table): continue
            header=next((row for row in table[:4] if row and ('Year Ended' in row[0] or row[0]=='June 30,')),[])
            years=[int(c) for c in header if re.fullmatch(r'20\d\d',c)]
            if year not in years: continue
            ctx=''
            for row in table:
                if not row: continue
                v=[c for c in row[1:] if c.strip()]
                if not v: ctx=row[0]
                if row[0]==label and (context is None or ctx==context) and len(v)==len(years):
                    s=v[years.index(year)].replace('$','').replace(',','').strip()
                    try: return float(s.strip('()'))*(-1 if s.startswith('(') else 1)
                    except ValueError: pass
    raise ValueError(('note',year,signature,label,context))
data={'actuals':{},'notes':{},'segments':list(csv.DictReader((R/'data/processed/recast_segments.csv').open(encoding='utf-8-sig'))),'valuation':json.loads((R/'data/processed/valuation_inputs.json').read_text()),'beta':json.loads((R/'data/processed/calculated_beta.json').read_text()),'manifest':json.loads((R/'data/source_manifest.json').read_text())}
mapping={7:('income_statement','Total revenue'),8:('income_statement','Total cost of revenue'),9:('income_statement','Gross margin'),10:('income_statement','Research and development'),11:('income_statement','Sales and marketing'),12:('income_statement','General and administrative'),13:('income_statement','Operating income'),18:('income_statement','Income before income taxes'),19:('income_statement','Provision for income taxes'),20:('income_statement','Net income'),25:('balance_sheet','Cash and cash equivalents'),26:('balance_sheet','Short-term investments'),27:('balance_sheet','Accounts receivable'),28:('balance_sheet','Inventories'),29:('balance_sheet','Other current assets'),30:('balance_sheet','Total current assets'),31:('balance_sheet','Property and equipment'),32:('balance_sheet','Operating lease right-of-use assets'),33:('balance_sheet','Equity and other investments'),34:('balance_sheet','Goodwill'),35:('balance_sheet','Intangible assets'),36:('balance_sheet','Other long-term assets'),37:('balance_sheet','Total assets'),39:('balance_sheet','Accounts payable'),40:('balance_sheet','Accrued compensation'),41:('balance_sheet','Short-term income taxes'),42:('balance_sheet','Short-term unearned revenue'),45:('balance_sheet','Current portion of long-term debt'),46:('balance_sheet','Total current liabilities'),47:('balance_sheet','Long-term debt'),48:('balance_sheet','Long-term income taxes'),49:('balance_sheet','Long-term unearned revenue'),50:('balance_sheet','Deferred income taxes'),51:('balance_sheet','Operating lease liabilities'),54:('balance_sheet','Total liabilities'),56:('balance_sheet','Common stock and paid-in capital'),57:('balance_sheet','Retained earnings'),58:('balance_sheet','Accumulated other comprehensive'),59:('balance_sheet','Total stockholders'),60:('balance_sheet','Total liabilities and stockholders'),63:('cash_flow','Net income'),64:('cash_flow','Depreciation, amortization, and other'),65:('cash_flow','Stock-based compensation expense'),66:('cash_flow','Deferred income taxes'),68:('cash_flow','Accounts receivable'),69:('cash_flow','Inventories'),70:('cash_flow','Other current assets'),71:('cash_flow','Other long-term assets'),72:('cash_flow','Accounts payable'),73:('cash_flow','Unearned revenue'),75:('cash_flow','Income taxes'),76:('cash_flow','Other long-term liabilities'),77:('cash_flow','Net cash from operations'),79:('cash_flow','Additions to property and equipment'),80:('cash_flow','Acquisition of companies'),82:('cash_flow','Other, net','Investing'),83:('cash_flow','Net cash used in investing'),86:('cash_flow','Repayments of debt'),87:('cash_flow','Common stock issued'),88:('cash_flow','Common stock repurchased'),89:('cash_flow','Common stock cash dividends paid'),92:('cash_flow','Net cash used in financing'),94:('cash_flow','Effect of foreign exchange rates'),95:('cash_flow','Net change in cash'),96:('cash_flow','Cash and cash equivalents, beginning'),97:('cash_flow','Cash and cash equivalents, end')}
for y in range(2022,2027):
    a={str(k):val(kind,y,label,*ctx) for k,(kind,label,*ctx) in mapping.items()}
    a['21']=val('income_statement',y,'Diluted','Weighted average shares outstanding:')
    a['22']=val('income_statement',y,'Diluted','Earnings per share:')
    a['14']=a['13']/a['7']
    a['15']=note(y,'Interest and dividends income','Interest and dividends income')
    a['16']=-note(y,'Interest and dividends income','Interest expense')
    a['17']=val('income_statement',y,'Other income (expense), net')-a['15']+a['16']
    a['44']=note(y,'Total finance lease liabilities','Other current liabilities','Finance Leases')
    a['53']=note(y,'Total finance lease liabilities','Other long-term liabilities','Finance Leases')
    a['43']=val('balance_sheet',y,'Other current liabilities')-a['44']
    a['52']=val('balance_sheet',y,'Other long-term liabilities')-a['53']
    a['67']=val('cash_flow',y,'Net recognized')
    a['74']=val('cash_flow',y,'Other current liabilities')
    a['81']=sum(val('cash_flow',y,l) for l in ['Purchases of investments','Maturities of investments','Sales of investments'])
    proceeds=[r for r in rows if r['statement']=='cash_flow' and int(r['fiscal_year'])==y and (r['metric'].startswith('Proceeds from issuance') or r['metric'].startswith('Proceeds from (repayments)'))]
    a['85']=sum(float(r['value']) for r in proceeds)
    principal=note(y,'Financing cash flows from finance leases','Financing cash flows from finance leases')
    a['90']=-principal
    a['91']=val('cash_flow',y,'Other, net','Financing')+principal
    a['98']=a['77']+a['79']
    data['actuals'][str(y)]=a
    data['notes'][str(y)]={'finance_lease_principal':principal,'finance_lease_additions':note(y,'Financing cash flows from finance leases','Finance leases','Right-of-use assets obtained in exchange for lease obligations:'),'finance_lease_interest':note(y,'Operating lease cost','Interest on lease liabilities'),'operating_lease_cost':note(y,'Operating lease cost','Operating lease cost'),'operating_lease_current':note(y,'Total finance lease liabilities','Other current liabilities','Operating Leases')}
data['schedules']={'debt_maturities':[9250,0,2001,0,500], 'legacy_lease_payments':[7121,7294,6668,6570,6543], 'intangible_amortization':[3097,2141,1944,1477,1128],'ppe_dep_2026':34300,'intangible_amort_2026':4700,'capex_payables_2026':26700,'capex_payables_2025':6900,'ending_shares_2026':7427,'dilution_2026':24,'ppe_land_2026':10546}
(R/'model/inputs.json').write_text(json.dumps(data,indent=2),encoding='utf-8')
print('Prepared actual statements, lease notes, recast segments and valuation inputs')
