"""Download public modeling sources and preserve table-level provenance (stdlib only)."""
import json, pathlib, urllib.request, datetime, hashlib, re
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[1]
ASOF = '2026-10-26'
class Tables(HTMLParser):
    def __init__(self):
        super().__init__(); self.tables=[]; self.rows=None; self.row=None; self.cell=None
    def handle_starttag(self, tag, attrs):
        if tag=='table': self.rows=[]
        if tag=='tr' and self.rows is not None: self.row=[]
        if tag in ('td','th') and self.row is not None: self.cell=[]
    def handle_data(self, data):
        if self.cell is not None: self.cell.append(data)
    def handle_endtag(self, tag):
        if tag in ('td','th') and self.cell is not None:
            self.row.append(re.sub(r'\s+', ' ', ''.join(self.cell)).strip()); self.cell=None
        if tag=='tr' and self.row is not None:
            if any(self.row): self.rows.append(self.row)
            self.row=None
        if tag=='table' and self.rows is not None:
            if self.rows: self.tables.append(self.rows)
            self.rows=None

SOURCES = [(f'ar{y}',f'https://www.microsoft.com/investor/reports/ar{str(y)[2:]}/index.html','html') for y in range(2022,2027)] + [
 ('companyfacts','https://data.sec.gov/api/xbrl/companyfacts/CIK0000789019.json','json'),
 ('submissions','https://data.sec.gov/submissions/CIK0000789019.json','json'),
 ('fy26q4','https://www.microsoft.com/en-us/Investor/earnings/FY-2026-Q4/press-release-webcast','html'),
 ('fy27segments','https://www.microsoft.com/en-us/Investor/','html'),
 ('treasury_2026','https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value=2026','html'),
 ('fy27_segment_recast','https://www.sec.gov/Archives/edgar/data/789019/000119312526380280/d291965dex991.htm','html'),
 ('fy26q4_transcript','https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/TranscriptFY26Q4.docx','docx'),
 ('fy26q4_financials','https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/FinancialStatementFY26Q4.xlsx','xlsx'),
 ('fy27q1_outlook','https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/OutlookFY27Q1.pptx','pptx'),
 ('fy26q4_metrics','https://www.microsoft.com/en-us/Investor/earnings/FY-2026-Q4/metrics','html'),
 ('equity_risk_premium','https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html','html'),
 ('industry_beta','https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/Betas.html','html'),
 ('msft_prices','https://query1.finance.yahoo.com/v8/finance/chart/MSFT?range=5y&interval=1mo','json'),
 ('benchmark_prices','https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=5y&interval=1mo','json'),
]

def run():
    (ROOT/'data/raw').mkdir(parents=True,exist_ok=True)
    (ROOT/'data/processed').mkdir(parents=True,exist_ok=True)
    manifest=[]
    previous={r['id']:r for r in json.loads((ROOT/'data/source_manifest.json').read_text())} if (ROOT/'data/source_manifest.json').exists() else {}
    for name,url,ext in SOURCES:
        if previous.get(name,{}).get('status')=='downloaded' and previous[name]['url']==url:
            manifest.append(previous[name]); continue
        row={'id':name,'url':url,'as_of':ASOF,'retrieved_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'FinancialModelResearch/1.0 contact research@example.com','Accept':'*/*'})
            with urllib.request.urlopen(req,timeout=60) as response: raw=response.read(); row['final_url']=response.url
            path=ROOT/'data/raw'/f'{name}.{ext}'; path.write_bytes(raw)
            row.update(status='downloaded',path=str(path.relative_to(ROOT)).replace('\\','/'),bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
            if ext=='html':
                parser=Tables(); parser.feed(raw.decode('utf-8',errors='replace'))
                (ROOT/'data/processed'/f'{name}_tables.json').write_text(json.dumps({'source':url,'tables':parser.tables},indent=2),encoding='utf-8')
                row['tables']=len(parser.tables)
        except Exception as exc: row.update(status='failed',error=str(exc))
        manifest.append(row); print(name,row['status'],row.get('bytes',row.get('error')),flush=True)
        (ROOT/'data/source_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    (ROOT/'data/source_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
if __name__=='__main__': run()
