"""Prepare model inputs from downloaded sources, without third-party packages."""
import csv, json, pathlib, re, datetime, statistics, zipfile, xml.etree.ElementTree as ET
from html.parser import HTMLParser
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'data/processed'
def write_csv(name, rows, fields=None):
    if not rows: return
    with (OUT/name).open('w',newline='',encoding='utf-8-sig') as f:
        w=csv.DictWriter(f,fieldnames=fields or list(rows[0])); w.writeheader(); w.writerows(rows)
def numeric(s):
    s=s.replace('$','').replace(',','').replace('\xa0','').strip()
    if re.fullmatch(r'\(?-?\d+(?:\.\d+)?\)?',s): return float(s.strip('()'))*(-1 if s.startswith('(') else 1)
    return None
def run():
    class Text(HTMLParser):
        def __init__(self): super().__init__(); self.parts=[]; self.hidden=0
        def handle_starttag(self,tag,attrs):
            if tag in ('script','style'): self.hidden+=1
        def handle_endtag(self,tag):
            if tag in ('script','style'): self.hidden=max(0,self.hidden-1)
        def handle_data(self,data):
            if not self.hidden: self.parts.append(data)
    for p in (ROOT/'data/raw').glob('*.html'):
        parser=Text(); parser.feed(p.read_text(encoding='utf-8',errors='replace'))
        (OUT/f'{p.stem}_text.txt').write_text(re.sub(r'\s+',' ',' '.join(parser.parts)),encoding='utf-8')
    for p in list((ROOT/'data/raw').glob('*.docx'))+list((ROOT/'data/raw').glob('*.pptx')):
        with zipfile.ZipFile(p) as z:
            parts=[]
            for name in z.namelist():
                if name=='word/document.xml' or re.fullmatch(r'ppt/slides/slide\d+\.xml',name):
                    root=ET.fromstring(z.read(name)); text=' '.join(e.text for e in root.iter() if e.tag.endswith('}t') and e.text)
                    parts.append(name+'\n'+(text or '[Image-based slide: open original PowerPoint. No text-layer content extracted.]'))
            (OUT/f'{p.stem}_text.txt').write_text('\n\n'.join(parts),encoding='utf-8')
    allrows=[]; annual=[]
    for file in sorted(OUT.glob('*_tables.json')):
        doc=json.loads(file.read_text(encoding='utf-8')); sid=file.stem.removesuffix('_tables')
        for ti,table in enumerate(doc['tables']):
            for ri,row in enumerate(table):
                allrows.append({'source_id':sid,'table_index':ti,'row_index':ri,'cells_json':json.dumps(row,ensure_ascii=False),'source_url':doc['source']})
            if not sid.startswith('ar20'): continue
            headers=[(ri,row) for ri,row in enumerate(table[:5]) if row and ('Year Ended June 30' in row[0] or row[0].strip()=='June 30,')]
            if not headers: continue
            hi,header=headers[0]; years=[int(x) for x in header if re.fullmatch('20[0-9]{2}',x)]
            if not years: continue
            context=''
            for ri,row in enumerate(table[hi+1:],hi+1):
                if not row: continue
                vals=[numeric(x) for x in row[1:] if x.strip()]
                if not vals: context=row[0]; continue
                # Only unambiguous one-value-per-year tables enter the tidy input file.
                if len(vals)!=len(years) or any(v is None for v in vals): continue
                for year,value in zip(years,vals):
                    annual.append({'source_id':sid,'table_index':ti,'row_index':ri,'context':context,'metric':row[0],'fiscal_year':year,'value':value,'unit':'USD millions except per-share amounts, share counts in millions, and explicitly labeled ratios','source_url':doc['source']})
    write_csv('source_table_rows.csv',allrows)
    write_csv('annual_report_numeric_rows.csv',annual)
    # Preserve every SEC observation and provenance. Consumers choose fiscal periods explicitly.
    facts=json.loads((ROOT/'data/raw/companyfacts.json').read_text())
    observations=[]
    for ns,concepts in facts['facts'].items():
        for concept,meta in concepts.items():
            for unit,entries in meta.get('units',{}).items():
                for e in entries:
                    if e.get('filed','9999')>'2026-10-26': continue
                    observations.append({'namespace':ns,'concept':concept,'label':meta.get('label',''),'unit':unit,**{k:e.get(k,'') for k in ['start','end','val','accn','fy','fp','form','filed','frame']}})
    write_csv('sec_facts.csv',observations)
    # Identify complete consolidated statements by distinct row labels, newest report wins.
    signatures={'income_statement':('Total revenue','Income before income taxes'), 'balance_sheet':('Total assets','Total current liabilities'), 'cash_flow':('Net cash from operations','Net cash used in investing')}
    statements=[]
    for kind,signature in signatures.items():
        chosen={}
        for sid in [f'ar{y}' for y in range(2026,2021,-1)]:
            doc=json.loads((OUT/f'{sid}_tables.json').read_text())
            for ti,table in enumerate(doc['tables']):
                labels=[r[0] for r in table if r]
                if not all(s in labels for s in signature): continue
                header=next((r for r in table[:5] if r and ('Year Ended June 30' in r[0] or r[0].strip()=='June 30,')),None)
                if not header: continue
                years=[int(x) for x in header if re.fullmatch('20[0-9]{2}',x)]
                for year in years:
                    if 2021<=year<=2026 and year not in chosen: chosen[year]=(sid,ti)
        for row in annual:
            if chosen.get(row['fiscal_year'])==(row['source_id'],row['table_index']): statements.append({'statement':kind,**row})
    write_csv('historical_statements.csv',statements)
    recast=(OUT/'fy27_segment_recast_text.txt').read_text(encoding='utf-8')
    segment_text=recast.split('Restated Historical Financials',1)[1].split('Segment History as Restated',1)[0]
    segments=[]
    for seg in ['Agents and Infra','Devices and Consumer','Total']:
        block=segment_text.split(seg+' Q1',1)[1]
        for metric in ['Revenue','Cost of revenue','Operating expenses','Operating income']:
            match=re.search(re.escape(metric)+r'\s+((?:\$?[\d,]+\s+){9}\$?[\d,]+)',block)
            if not match: raise ValueError('Missing recast '+seg+' '+metric)
            vals=[numeric(v) for v in match[1].split()]
            for i,value in enumerate(vals):
                segments.append({'segment':seg,'metric':metric,'fiscal_year':2026 if i<5 else 2025,'period':['Q1','Q2','Q3','Q4','FY'][i%5],'value_usd_millions':value,'source_id':'fy27_segment_recast','basis':'FY27 reporting structure; issued September 2, 2026'})
    write_csv('recast_segments.csv',segments)
    checks=[]
    def get(kind,y,label):
        return next(r['value'] for r in statements if r['statement']==kind and r['fiscal_year']==y and r['metric']==label)
    for y in range(2022,2027):
        for name,kind,a,b in [('balance_sheet_balances','balance_sheet','Total assets','Total liabilities and stockholders’ equity')]:
            try: delta=get(kind,y,a)-get(kind,y,b); checks.append({'year':y,'check':name,'difference_usd_millions':delta,'passed':abs(delta)<0.01})
            except StopIteration: checks.append({'year':y,'check':name,'difference_usd_millions':'missing','passed':False})
        try:
            delta=get('income_statement',y,'Income before income taxes')-get('income_statement',y,'Provision for income taxes')-get('income_statement',y,'Net income')
            checks.append({'year':y,'check':'pretax_less_tax_equals_net_income','difference_usd_millions':delta,'passed':abs(delta)<0.01})
            delta=get('cash_flow',y,'Cash and cash equivalents, beginning of period')+get('cash_flow',y,'Net change in cash and cash equivalents')-get('cash_flow',y,'Cash and cash equivalents, end of period')
            checks.append({'year':y,'check':'cash_rollforward','difference_usd_millions':delta,'passed':abs(delta)<0.01})
        except StopIteration: checks.append({'year':y,'check':'statement_rows_present','difference_usd_millions':'missing','passed':False})
    write_csv('validation.csv',checks)
    for y in [2025,2026]:
        for metric in ['Revenue','Cost of revenue','Operating expenses','Operating income']:
            rows=[r for r in segments if r['fiscal_year']==y and r['metric']==metric and r['period']=='FY']
            delta=sum(r['value_usd_millions'] for r in rows if r['segment']!='Total')-next(r['value_usd_millions'] for r in rows if r['segment']=='Total')
            checks.append({'year':y,'check':'recast_segment_sum_'+metric,'difference_usd_millions':delta,'passed':abs(delta)<0.01})
        for seg in ['Agents and Infra','Devices and Consumer','Total']:
            for metric in ['Revenue','Cost of revenue','Operating expenses','Operating income']:
                rows=[r for r in segments if r['fiscal_year']==y and r['metric']==metric and r['segment']==seg]
                delta=sum(r['value_usd_millions'] for r in rows if r['period']!='FY')-next(r['value_usd_millions'] for r in rows if r['period']=='FY')
                checks.append({'year':y,'check':'quarter_sum_'+seg+'_'+metric,'difference_usd_millions':delta,'passed':abs(delta)<0.01})
    write_csv('validation.csv',checks)
    drivers=[]
    for y in range(2022,2027):
        rev=get('income_statement',y,'Total revenue'); ebit=get('income_statement',y,'Operating income')
        metrics={'revenue_usd_millions':rev,'operating_margin':ebit/rev,'effective_tax_rate':get('income_statement',y,'Provision for income taxes')/get('income_statement',y,'Income before income taxes'),'cash_capex_usd_millions':-get('cash_flow',y,'Additions to property and equipment'),'cash_from_operations_usd_millions':get('cash_flow',y,'Net cash from operations')}
        metrics['cash_capex_to_revenue']=metrics['cash_capex_usd_millions']/rev
        metrics['cash_flow_less_cash_capex']=metrics['cash_from_operations_usd_millions']-metrics['cash_capex_usd_millions']
        if y>2022: metrics['revenue_growth']=rev/get('income_statement',y-1,'Total revenue')-1
        drivers.extend({'fiscal_year':y,'metric':k,'value':v,'basis':'calculated from historical_statements.csv; cash-flow-less-capex is levered and is not DCF unlevered FCF'} for k,v in metrics.items())
    write_csv('historical_drivers.csv',drivers)
    treasury=json.loads((OUT/'treasury_2026_tables.json').read_text())['tables'][0]
    eligible=[r for r in treasury[1:] if r and re.fullmatch(r'\d\d/\d\d/2026',r[0]) and datetime.datetime.strptime(r[0],'%m/%d/%Y').date().isoformat()<='2026-10-26']
    last=eligible[-1]; tenyear=[i for i,c in enumerate(treasury[0]) if c=='10 Yr'][-1]
    market_meta=json.loads((ROOT/'data/raw/msft_prices.json').read_text())['chart']['result'][0]['meta']
    erp_tables=json.loads((OUT/'equity_risk_premium_tables.json').read_text())['tables']
    us=next(r for t in erp_tables for r in t if r and r[0]=='United States')
    snapshot={'as_of':'2026-10-26','risk_free_rate':{'value':float(last[tenyear])/100,'observation_date':last[0],'source':'treasury_2026','method':'10-year nominal par Treasury yield; choose maturity consistently with USD DCF'},'msft_quote':{'value':market_meta['regularMarketPrice'],'currency':'USD','timestamp_utc':datetime.datetime.fromtimestamp(market_meta['regularMarketTime'],datetime.timezone.utc).isoformat(),'source':'msft_prices','status':'intraday or delayed snapshot; not asserted to be closing price'},'us_equity_risk_premium':{'value':float(us[4].strip('%'))/100,'source':'equity_risk_premium','source_row':us,'status':'published Damodaran estimate, not a company fact; verify source vintage before valuation'},'cost_of_debt':{'value':None,'status':'select marginal borrowing rate using Treasury curve and credit spread; historical interest/debt is only a cross-check'},'terminal_growth':{'value':None,'status':'analyst assumption; must be less than WACC'},'wacc':{'value':None,'status':'calculate after choosing capital structure, beta, debt spread, ERP and normalized tax rate'}}
    (OUT/'valuation_inputs.json').write_text(json.dumps(snapshot,indent=2))
    market=[]; series={}
    for sid in ['msft_prices','benchmark_prices']:
        doc=json.loads((ROOT/f'data/raw/{sid}.json').read_text()); result=doc['chart']['result'][0]
        series[sid]={}
        adjusted=result['indicators'].get('adjclose',[{}])[0].get('adjclose',[])
        closes=result['indicators']['quote'][0]['close']
        for i,ts in enumerate(result['timestamp']):
            date=datetime.datetime.fromtimestamp(ts,datetime.timezone.utc).date().isoformat()
            if date>'2026-10-26': continue
            adj=adjusted[i] if i<len(adjusted) else None
            market.append({'source_id':sid,'date':date,'close_usd_or_index':closes[i],'adjusted_close':adj,'interval':'monthly; final bar may be incomplete'})
            if adj is not None: series[sid][date[:7]]=adj
    write_csv('market_prices.csv',market)
    # Exclude October 2026 partial month. Align months before forming returns.
    dates=sorted(set(series['msft_prices'])&set(series['benchmark_prices']))
    dates=[d for d in dates if d<'2026-10']
    returns=[]
    for a,b in zip(dates,dates[1:]):
        returns.append((series['msft_prices'][b]/series['msft_prices'][a]-1,series['benchmark_prices'][b]/series['benchmark_prices'][a]-1))
    if len(returns)>2:
        x=[r[1] for r in returns]; y=[r[0] for r in returns]; xm=statistics.mean(x); ym=statistics.mean(y)
        beta=sum((a-xm)*(b-ym) for a,b in zip(x,y))/sum((a-xm)**2 for a in x)
        (OUT/'calculated_beta.json').write_text(json.dumps({'beta':beta,'observations':len(returns),'first_month':dates[0],'last_month':dates[-1],'method':'OLS slope, monthly adjusted-close simple returns, MSFT versus S&P 500 price index (not a total-return benchmark); excludes partial current month','source_files':['data/raw/msft_prices.json','data/raw/benchmark_prices.json']},indent=2))
    (OUT/'validation_summary.json').write_text(json.dumps({'checks':len(checks),'passed':sum(c['passed'] for c in checks),'failed':[c for c in checks if not c['passed']],'annual_numeric_rows':len(annual),'sec_observations':len(observations),'statement_rows':len(statements)},indent=2))
    print((OUT/'validation_summary.json').read_text())
if __name__=='__main__': run()
