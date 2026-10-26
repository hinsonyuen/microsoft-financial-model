import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=JSON.parse(await fs.readFile(path.join(root,'model/inputs.json'),'utf8'));
const out=path.join(root,'outputs/msft-model'); await fs.mkdir(out,{recursive:true});
const wb=Workbook.create();
const names=['Overview','Assumptions','Statements','Revenue','Capital','Funding','DCF','Actuals','Checks','Guide'];
const sh=Object.fromEntries(names.map(n=>[n,wb.worksheets.add(n)]));
const cols=['D','E','F','G','H','I','J','K','L','M'], fc=cols.slice(5), years=cols.map((_,i)=>2022+i);
const navy='#193B5A',blue='#0000FF',green='#008000',ink='#182735',gray='#E8EDF2',amber='#FFF2CC';
const num='#,##0;(#,##0);"-"', usd='$#,##0;($#,##0);"-"',pct='0.0%;(0.0%);"-"',price='$0.00;($0.00);"-"';
const v=(s,a,x)=>sh[s].getRange(a).values=[[x]];
const f=(s,a,x)=>sh[s].getRange(a).formulas=[[x.startsWith('=')?x:'='+x]];
function row(s,r,label,vals=null){v(s,'C'+r,label); if(vals)sh[s].getRange(`D${r}:M${r}`).values=[vals];}
function forecasts(s,r,fn){sh[s].getRange(`I${r}:M${r}`).formulas=[fc.map((c,i)=>'='+fn(c,cols[i+4],i))];}
function band(s,r,label){row(s,r,label);sh[s].getRange(`C${r}:M${r}`).format={fill:navy,font:{color:'#FFFFFF',bold:true},rowHeight:23};}
function total(s,r){sh[s].getRange(`C${r}:M${r}`).format={font:{bold:true},borders:{top:{style:'thin',color:'#A9B6C2'}}};}
function note(s,r,text){v(s,'O'+r,text);sh[s].getRange('O'+r).format.font={color:'#5C6874',size:10};}
function percent(s,rs){for(const r of rs){sh[s].getRange(`D${r}:M${r}`).setNumberFormat(pct);sh[s].getRange(`C${r}:M${r}`).format.font.italic=true;}}
function base(s,title,max=110){let t=sh[s];t.showGridLines=false;t.getRange(`C1:Q${max}`).format={font:{name:'Arial',size:10,color:ink},rowHeight:20,verticalAlignment:'center',wrapText:false};t.getRange(`A1:B${max}`).format.columnWidth=2;t.getRange(`C1:C${max}`).format.columnWidth=47;t.getRange(`D1:M${max}`).format.columnWidth=14;t.getRange(`N1:N${max}`).format.columnWidth=3;t.getRange(`O1:O${max}`).format.columnWidth=110;t.getRange(`P1:Q${max}`).format.columnWidth=16;t.getRange(`D5:M${max}`).setNumberFormat(num);t.getRange(`D5:M${max}`).format.horizontalAlignment='right';v(s,'C2',title);t.getRange('C2:M2').format={font:{size:15,bold:true,color:navy},rowHeight:28,borders:{bottom:{style:'thin',color:navy}}};v(s,'C3','USD millions except shares (millions), per-share values and rates');t.getRange('C3:M3').format.font={italic:true,color:'#5C6874'};t.getRange('D4:M4').values=[years.map(y=>`FY:${String(y).slice(2)} ${y<=2026?'A':'F'}`)];t.getRange('C4:M4').format={fill:navy,font:{color:'#FFFFFF',bold:true},horizontalAlignment:'center',rowHeight:24};t.getRange(`D5:H${max}`).format.fill='#F3F0E9';t.getRange(`I5:M${max}`).format.font.color=green;t.freezePanes.freezeRows(4);t.freezePanes.freezeColumns(3);}
for(const s of names)base(s,{'Overview':'Microsoft forecast and valuation','Assumptions':'Forecast assumptions','Statements':'Linked financial statements','Revenue':'Segment revenue and operating profit','Capital':'Capital investment and leases','Funding':'Debt, shares and capital returns','DCF':'Discounted cash flow valuation','Actuals':'Reported data and source adjustments','Checks':'Historical and forecast checks','Guide':'How to use the model'}[s],s==='Actuals'?139:s==='Statements'?106:s==='Assumptions'?50:90);
sh.Overview.tabColor=navy;sh.DCF.tabColor=navy;sh.Assumptions.tabColor='#497C9D';sh.Actuals.tabColor='#E9DCC3';sh.Guide.tabColor='#B7C6C4';
const labels={6:'INCOME STATEMENT',7:'Revenue',8:'Cost of revenue',9:'Gross profit',10:'Research and development',11:'Sales and marketing',12:'General and administrative',13:'Operating income',14:'Operating margin',15:'Interest and dividend income',16:'Interest expense',17:'Other nonoperating gains / (losses)',18:'Income before tax',19:'Income tax expense',20:'Net income',21:'Weighted-average diluted shares',22:'Diluted EPS',24:'BALANCE SHEET',25:'Cash and cash equivalents',26:'Short-term investments',27:'Accounts receivable',28:'Inventories',29:'Other current assets',30:'Total current assets',31:'Property and equipment, net',32:'Operating lease right-of-use assets',33:'Equity and other investments',34:'Goodwill',35:'Intangible assets, net',36:'Other long-term assets',37:'Total assets',39:'Accounts payable (trade and capex)',40:'Accrued compensation',41:'Current income taxes payable',42:'Current deferred revenue',43:'Other current liabilities, ex finance leases',44:'Current finance lease liability',45:'Current corporate debt',46:'Total current liabilities',47:'Long-term corporate debt',48:'Long-term income tax liabilities',49:'Long-term deferred revenue',50:'Deferred income tax liabilities',51:'Long-term operating lease liabilities',52:'Other long-term liabilities, ex finance leases',53:'Long-term finance lease liabilities',54:'Total liabilities',56:'Common stock and paid-in capital',57:'Retained earnings',58:'Accumulated other comprehensive income',59:'Total equity',60:'Total liabilities and equity',62:'CASH FLOW STATEMENT',63:'Net income',64:'D&A and other (A) / D&A (F)',65:'Stock-based compensation',66:'Deferred tax adjustment',67:'Other noncash adjustments / ROU amortization',68:'Change in accounts receivable',69:'Change in inventories',70:'Change in other current assets',71:'Change in other long-term assets',72:'Change in trade accounts payable',73:'Change in deferred revenue',74:'Change in compensation and other accruals',75:'Change in income tax liabilities',76:'Other liabilities and operating lease principal',77:'Cash from operations',79:'Cash capital expenditure',80:'Acquisitions and intangible purchases',81:'Net investment purchases / proceeds',82:'Other investing cash flow',83:'Cash from investing',85:'Corporate debt issued',86:'Corporate debt repaid',87:'Proceeds from stock issuance',88:'Share repurchases',89:'Dividends paid',90:'Finance lease principal paid',91:'Other financing cash flow',92:'Cash from financing',94:'FX effect on cash',95:'Net change in cash',96:'Beginning cash',97:'Ending cash',98:'Operating cash flow less cash capex',101:'Operating working capital, excluding capex AP'};
for(const s of ['Actuals','Statements']){
 for(const [r,label] of Object.entries(labels))row(s,+r,label);
 for(const r of [6,24,62])band(s,r,labels[r]);
 for(const r of [7,9,13,18,20,30,37,46,54,59,60,77,83,92,95,97,98])total(s,r);
 percent(s,[14]);sh[s].getRange('D22:M22').setNumberFormat(price);
}
for(const c of cols.slice(0,5)){
 const y=years[cols.indexOf(c)],a=input.actuals[y];
 for(const [r,x]of Object.entries(a)){v('Actuals',c+r,x);f('Statements',c+r,`'Actuals'!${c}${r}`);}
}
sh.Actuals.getRange('D5:H139').format.font.color=blue;
for(const [r,label,value]of [[110,'MSFT quote, October 26, 2026',input.valuation.msft_quote.value],[112,'10-year Treasury yield, October 23, 2026',input.valuation.risk_free_rate.value],[113,'Published US equity risk premium',input.valuation.us_equity_risk_premium.value],[114,'Historical monthly beta',input.beta.beta],[115,'Ending basic shares, June 30, 2026',7427],[116,'Incremental diluted shares proxy',24],[117,'PP&E depreciation FY2026 (rounded note)',34300],[118,'Intangible amortization FY2026 (rounded note)',4700],[119,'Capex included in accounts payable FY2026',26700],[120,'Current operating lease liability FY2026',5393],[121,'Land FY2026',10546],[122,'Corporate debt carrying amount FY2026',40294]]){row('Actuals',r,label);v('Actuals','H'+r,value);}
row('Actuals',111,'Quote timestamp (UTC)');v('Actuals','H111',input.valuation.msft_quote.timestamp_utc);
row('Actuals',126,'Debt principal maturities');row('Actuals',127,'Legacy finance lease cash payments');row('Actuals',128,'Scheduled acquired-intangible amortization');
for(const [r,key]of [[126,'debt_maturities'],[127,'legacy_lease_payments'],[128,'intangible_amortization']])sh.Actuals.getRange(`I${r}:M${r}`).values=[input.schedules[key]];
row('Actuals',129,'FY2032 legacy finance lease payment estimate');v('Actuals','M129',6543);
row('Actuals',130,'Finance lease discount rate FY2026');v('Actuals','H130',.045);
row('Actuals',131,'Operating lease discount rate FY2026');v('Actuals','H131',.037);
row('Actuals',132,'Finance lease remaining term, years');v('Actuals','H132',13);
row('Actuals',133,'Operating lease remaining term, years');v('Actuals','H133',6);
row('Actuals',134,'Finance lease additions FY2026');v('Actuals','H134',24608);
row('Actuals',135,'Operating lease additions FY2026');v('Actuals','H135',4555);
row('Actuals',136,'Operating lease cost FY2026');v('Actuals','H136',6968);
row('Actuals',137,'Depreciation allocation to Agents and Infra');v('Actuals','H137',.95);
row('Actuals',138,'Amortization allocation to Agents and Infra');v('Actuals','H138',.4);
row('Actuals',139,'Finance lease interest FY2026');v('Actuals','H139',input.notes['2026'].finance_lease_interest);
for(const r of [112,113,130,131,137,138])sh.Actuals.getRange('H'+r).setNumberFormat(pct);
const arurl='https://www.microsoft.com/investor/reports/ar26/index.html';
const recasturl='https://www.sec.gov/Archives/edgar/data/789019/000119312526380280/d291965dex991.htm';
for(const r of [7,25,39,56,63,79,85])note('Actuals',r,'Source: newest annual-report comparative, FY2022–FY2026. https://www.microsoft.com/investor/reports/ar26/index.html');
note('Actuals',43,'Reclassified: reported other current liabilities less current finance lease liabilities (lease note).');
note('Actuals',52,'Reclassified: reported other long-term liabilities less long-term finance lease liabilities.');
note('Actuals',90,'Finance lease principal split from Other financing. Other financing is adjusted by the same amount.');
note('Actuals',110,'Source: Yahoo chart snapshot. '+input.valuation.msft_quote.timestamp_utc+' UTC. Intraday/delayed, not closing price.');
note('Actuals',112,'Source: US Treasury. '+input.manifest.find(x=>x.id==='treasury_2026').url);
note('Actuals',113,'Source: Damodaran country risk premium snapshot, published estimate. '+input.manifest.find(x=>x.id==='equity_risk_premium').url);
note('Actuals',114,'OLS, 58 monthly returns to September 2026. S&P 500 price-index benchmark.');
note('Actuals',117,'Source: FY2026 annual report, PP&E note. Note rounds depreciation to $34.3bn and amortization to $4.7bn.');
note('Actuals',119,'Source: PP&E note. Purchases of PP&E remaining in accounts payable.');
note('Actuals',126,'Source: debt maturity and intangible amortization notes. Carrying-value debt is refinanced at maturity.');
note('Actuals',127,'Source: lease maturity note, legacy obligations at June 30, 2026.');
note('Actuals',129,'Analyst estimate: holds the FY2031 legacy payment constant for FY2032 current-liability classification.');
note('Actuals',137,'Analyst allocation proxy used only to calibrate historical segment cash costs: 95% of depreciation and 40% of amortization.');

// Operating assumptions: one editable base forecast, calibrated against actuals on Revenue/Statements.
const A={
6:['Agents and Infra revenue growth',[.25,.22,.19,.16,.13],'Analyst: growth slows as the business becomes larger. FY27 Q1 guidance is a near-term cross-check.'],
7:['Devices and Consumer revenue growth',[.01,.03,.04,.04,.03],'Analyst: weak near-term Windows and gaming, then modest recovery.'],
8:['Agents cash gross margin, before D&A / rent',[.83,.84,.85,.86,.865],'Analyst: mix and utilization gains. Depreciation and operating lease expense are deducted separately.'],
9:['Consumer cash gross margin, before D&A / rent',[.70,.71,.72,.73,.73],'Analyst: mature-business mix and cost discipline. Historical cash margin uses an allocation estimate.'],
10:['Agents operating expense / revenue',[.18,.175,.17,.165,.16],'Analyst: slower operating-cost growth than revenue. Stock compensation remains an expense.'],
11:['Consumer operating expense / revenue',[.31,.305,.30,.295,.29],'Analyst: gradual operating leverage.'],
12:['R&D share of operating expenses',Array(5).fill(35562/70228),'FY2026 expense mix held constant.'],
13:['Sales / marketing share of operating expenses',Array(5).fill(26710/70228),'FY2026 expense mix held constant.'],
14:['G&A share of operating expenses',Array(5).fill(7956/70228),'FY2026 expense mix held constant.'],
15:['Normalized income tax rate',Array(5).fill(.20),'Analyst: 20%, aligned with near-term guidance. Discrete investment gains are excluded.'],
16:['Cash capital expenditure / revenue',[.42,.37,.32,.28,.25],'Analyst: infrastructure build stays high, then spending intensity eases.'],
17:['New finance leases / revenue',[.04,.035,.03,.025,.02],'Analyst: reduced finance-lease share reflects the announced shift toward operating leases.'],
18:['New operating leases / revenue',[.03,.03,.03,.025,.025],'Analyst: more leased capacity after building-life changes. Cash rent is calculated in Capital.'],
19:['Capex accounts payable / cash capex',[.20,.18,.16,.15,.15],'Analyst: capital creditor balance moderates from FY2026. Kept outside operating working capital.'],
20:['Stock compensation / revenue',[.037,.036,.035,.034,.033],'Analyst: slight dilution-cost leverage. Added back only in cash flow, never in DCF.'],
21:['Receivable collection days',Array(5).fill(80876/331839*365),'FY2026 receivable days held constant.'],
22:['Inventory holding days',Array(5).fill(1397/106374*365),'FY2026 inventory / cost-of-revenue days held constant.'],
23:['Trade payable days',Array(5).fill((42416-26700)/106374*365),'FY2026 trade AP excludes $26.7bn of capital purchases.'],
24:['Other current assets / revenue',Array(5).fill(48594/331839),'FY2026 balance scaled with sales. Review unusual tax/investment items in a detailed model.'],
25:['Accrued compensation / revenue',Array(5).fill(14945/331839),'FY2026 ratio held constant.'],
26:['Current deferred revenue / revenue',Array(5).fill(72965/331839),'FY2026 ratio held constant.'],
27:['Other operating current liabilities / revenue',Array(5).fill((26738-4290-5393)/331839),'Excludes both finance-lease and operating-lease current liabilities.'],
28:['Current tax payable / tax expense',Array(5).fill(2534/32185),'FY2026 ratio held constant. Long-term and deferred taxes are held flat.'],
29:['Long-term deferred revenue / revenue',Array(5).fill(2747/331839),'FY2026 ratio held constant.'],
30:['Dividends / net income',Array(5).fill(.20),'Analyst capital-return policy, not management guidance.'],
31:['Share repurchases / net income',Array(5).fill(.15),'Analyst policy. Repurchase price uses a separate share-price path.'],
32:['Yield on opening cash and short-term investments',Array(5).fill(.04),'Analyst: opening balances avoid circular interest calculations.'],
33:['Share price growth for issuance / repurchases',Array(5).fill(.05),'Transaction-price assumption only. Does not determine intrinsic value.'],
34:['Legacy corporate debt interest rate',Array(5).fill(.03),'Analyst proxy for fixed-rate legacy bonds. Refinance maturities at marginal borrowing cost.'],
35:['Marginal debt credit spread',Array(5).fill(.0055),'Analyst: 55bp above the 10-year Treasury, not an observed bond quote.'],
36:['Finance lease interest rate',Array(5).fill(.045),'FY2026 disclosed weighted-average lease discount rate.'],
37:['Operating lease imputed interest rate',Array(5).fill(.037),'FY2026 disclosed rate. Part of operating rent, not financing interest in the income statement.'],
38:['New short-lived equipment life, years',Array(5).fill(6),'Analyst: six-year straight-line life. Half-year depreciation for additions.'],
39:['New buildings life, years',Array(5).fill(25),'FY27 announced building-life extension. Applied to the modeled long-lived share of additions.'],
40:['Short-lived share of PP&E additions',Array(5).fill(2/3),'Analyst mix anchored to management commentary that roughly two thirds of recent capex is short-lived.'],
41:['Existing PP&E remaining depreciation life, years',Array(5).fill(8),'Analyst aggregate remaining-life estimate, excluding land. Simplifies existing asset vintages.'],
42:['New finance lease principal term, years',Array(5).fill(13),'Analyst straight-line principal proxy, anchored to disclosed 13-year remaining lease term.'],
43:['Operating lease asset amortization term, years',Array(5).fill(6),'Analyst blended replacement-lease term, anchored to disclosed six-year remaining term.'],
44:['Cash proceeds from stock issuance',[2109,2214,2325,2441,2563],'Analyst: approximately 5% annual growth from FY2026 proceeds.'],
45:['Incremental diluted share allowance',Array(5).fill(24),'FY2026 diluted less basic weighted-average shares. A proxy, not an award-by-award treasury-stock model.']};
for(const [r,[label,vals,why]] of Object.entries(A)){
 row('Assumptions',+r,label);sh.Assumptions.getRange(`I${r}:M${r}`).values=[vals];note('Assumptions',+r,why);
 sh.Assumptions.getRange(`I${r}:M${r}`).format={font:{color:blue},fill:amber};
 if(![21,22,23,38,39,41,42,43,44,45].includes(+r))percent('Assumptions',[+r]);
}
v('Assumptions','O4','Basis and explanation');v('Assumptions','C48','Blue numbers in pale yellow are editable assumptions. Green formulas link to another worksheet.');
for(const r of [6,7,8,9,10,11])f('Assumptions','H'+r,`'Revenue'!H${({6:8,7:18,8:10,9:20,10:13,11:23})[r]}`);
for(const [r,expr]of [[15,"'Statements'!H19/'Statements'!H18"],[16,"-'Statements'!H79/'Statements'!H7"],[17,"'Actuals'!H134/'Statements'!H7"],[18,"'Actuals'!H135/'Statements'!H7"],[19,"'Actuals'!H119/(-'Statements'!H79)"],[20,"'Statements'!H65/'Statements'!H7"],[21,"'Statements'!H27/'Statements'!H7*365"],[22,"'Statements'!H28/'Statements'!H8*365"],[23,"('Statements'!H39-'Actuals'!H119)/'Statements'!H8*365"],[24,"'Statements'!H29/'Statements'!H7"],[25,"'Statements'!H40/'Statements'!H7"],[26,"'Statements'!H42/'Statements'!H7"],[27,"('Statements'!H43-'Actuals'!H120)/'Statements'!H7"],[28,"'Statements'!H41/'Statements'!H19"],[29,"'Statements'!H49/'Statements'!H7"],[30,"-'Statements'!H89/'Statements'!H20"],[31,"-'Statements'!H88/'Statements'!H20"]])f('Assumptions','H'+r,expr);

// Revenue build, new segment structure. Historical cash margins are calibrated estimates.
for(const [r,label]of Object.entries({6:'AGENTS AND INFRA',7:'Revenue',8:'Revenue growth',9:'Cash gross profit before D&A / operating rent',10:'Cash gross margin before D&A / operating rent',11:'D&A and operating rent allocation',12:'Operating expenses',13:'Operating expenses / revenue',14:'Operating income',16:'DEVICES AND CONSUMER',17:'Revenue',18:'Revenue growth',19:'Cash gross profit before D&A / operating rent',20:'Cash gross margin before D&A / operating rent',21:'D&A and operating rent allocation',22:'Operating expenses',23:'Operating expenses / revenue',24:'Operating income',26:'CONSOLIDATED OPERATING BUILD',27:'Revenue',28:'Cost of revenue, including D&A and rent',29:'Gross profit',30:'Operating expenses',31:'Operating income',32:'Operating margin',33:'Reported company operating income control'}))row('Revenue',+r,label);
for(const r of [6,16,26])band('Revenue',r,({6:'AGENTS AND INFRA',16:'DEVICES AND CONSUMER',26:'CONSOLIDATED OPERATING BUILD'})[r]);
for(const [year,c]of [[2025,'G'],[2026,'H']]){
 const seg=(s,m)=>Number(input.segments.find(r=>r.segment===s&&r.metric===m&&Number(r.fiscal_year)===year&&r.period==='FY').value_usd_millions);
 for(const [r,x]of [[7,seg('Agents and Infra','Revenue')],[12,seg('Agents and Infra','Operating expenses')],[14,seg('Agents and Infra','Operating income')],[17,seg('Devices and Consumer','Revenue')],[22,seg('Devices and Consumer','Operating expenses')],[24,seg('Devices and Consumer','Operating income')],[33,seg('Total','Operating income')]])v('Revenue',c+r,x);
 if(year===2026){f('Revenue',c+'11',"'Actuals'!H117*'Actuals'!H137+'Actuals'!H118*'Actuals'!H138+'Actuals'!H136*H7/H27");f('Revenue',c+'21',"'Actuals'!H117*(1-'Actuals'!H137)+'Actuals'!H118*(1-'Actuals'!H138)+'Actuals'!H136*H17/H27");f('Revenue',c+'9',`${c}14+${c}12+${c}11`);f('Revenue',c+'19',`${c}24+${c}22+${c}21`);f('Revenue',c+'10',`${c}9/${c}7`);f('Revenue',c+'20',`${c}19/${c}17`);}
 f('Revenue',c+'13',`${c}12/${c}7`);f('Revenue',c+'23',`${c}22/${c}17`);f('Revenue',c+'27',`SUM(${c}7,${c}17)`);f('Revenue',c+'30',`SUM(${c}12,${c}22)`);f('Revenue',c+'31',`SUM(${c}14,${c}24)`);f('Revenue',c+'29',`${c}31+${c}30`);f('Revenue',c+'28',`${c}27-${c}29`);f('Revenue',c+'32',`${c}31/${c}27`);
}
f('Revenue','H8','H7/G7-1');f('Revenue','H18','H17/G17-1');
for(const c of ['G','H'])for(const r of [7,12,14,17,22,24,33])sh.Revenue.getRange(c+r).format.font.color=blue;
for(const [r,fn]of Object.entries({7:(c,p)=>`${p}7*(1+'Assumptions'!${c}6)`,8:c=>`'Assumptions'!${c}6`,9:c=>`${c}7*${c}10`,10:c=>`'Assumptions'!${c}8`,11:c=>`('Capital'!${c}21+'Capital'!${c}54)*${c}7/${c}27`,12:c=>`${c}7*'Assumptions'!${c}10`,13:c=>`'Assumptions'!${c}10`,14:c=>`${c}9-${c}11-${c}12`,17:(c,p)=>`${p}17*(1+'Assumptions'!${c}7)`,18:c=>`'Assumptions'!${c}7`,19:c=>`${c}17*${c}20`,20:c=>`'Assumptions'!${c}9`,21:c=>`('Capital'!${c}21+'Capital'!${c}54)*${c}17/${c}27`,22:c=>`${c}17*'Assumptions'!${c}11`,23:c=>`'Assumptions'!${c}11`,24:c=>`${c}19-${c}21-${c}22`,27:c=>`SUM(${c}7,${c}17)`,28:c=>`${c}27-SUM(${c}9,${c}19)+'Capital'!${c}21+'Capital'!${c}54`,29:c=>`${c}27-${c}28`,30:c=>`SUM(${c}12,${c}22)`,31:c=>`SUM(${c}14,${c}24)`,32:c=>`${c}31/${c}27`}))forecasts('Revenue',+r,fn);
for(const r of [7,14,17,24,27,29,31])total('Revenue',r);percent('Revenue',[8,10,13,18,20,23,32]);note('Revenue',7,'Source: FY27 segment recast. '+recasturl);note('Revenue',10,'Historical cash margin is an analyst calibration using allocated reported depreciation, amortization and operating rent.');
note('Revenue',11,'Forecast D&A and rent allocated by revenue share. Consolidated totals are independent of that allocation.');

// Capital investment: distinguish cash purchases, capital creditors, finance leases and operating leases.
const capLabels={6:'Cash capital expenditure / revenue',7:'Cash capital expenditure',8:'Capital purchases in accounts payable, ending',9:'PP&E obtained through new finance leases',10:'Change in capital purchases payable',11:'Total PP&E asset additions',12:'Short-lived equipment additions',13:'Long-lived building additions',15:'Existing depreciable PP&E, opening',16:'Depreciation on existing PP&E',17:'Existing depreciable PP&E, ending',18:'Depreciation on new equipment',19:'Depreciation on new buildings',20:'Total PP&E depreciation',21:'Total depreciation and acquired amortization',22:'PP&E, beginning',23:'PP&E, ending',25:'Acquired intangible assets, beginning',26:'Scheduled acquired-intangible amortization',27:'Acquired intangible assets, ending',29:'FINANCE LEASES',30:'Legacy finance lease liabilities, opening',31:'Legacy contractual cash payments',32:'Interest on legacy finance leases',33:'Legacy finance lease principal paid',34:'Legacy finance lease liabilities, ending',35:'New finance lease liabilities, opening',36:'New finance lease liabilities added',37:'Principal repaid on new finance leases',38:'New finance lease liabilities, ending',39:'Total finance lease liabilities',40:'Total finance lease interest',41:'Total finance lease principal paid',43:'Current finance lease liability',44:'Long-term finance lease liability',46:'OPERATING LEASES',47:'Operating right-of-use assets, opening',48:'Operating right-of-use assets added',49:'Operating right-of-use amortization',50:'Operating right-of-use assets, ending',51:'Operating lease liabilities, opening',52:'Operating lease imputed interest',53:'Operating lease cash payments',54:'Operating lease expense in cost of revenue',55:'Operating lease liabilities, ending',56:'Current operating lease liability',57:'Long-term operating lease liability'};
for(const [r,l]of Object.entries(capLabels))row('Capital',+r,l);for(const r of [29,46])band('Capital',r,capLabels[r]);
const cfns={6:c=>`'Assumptions'!${c}16`,7:c=>`'Revenue'!${c}27*${c}6`,8:c=>`${c}7*'Assumptions'!${c}19`,9:c=>`'Revenue'!${c}27*'Assumptions'!${c}17`,10:(c,p,i)=>`${c}8-${i===0?"'Actuals'!H119":p+'8'}`,11:c=>`SUM(${c}7,${c}9,${c}10)`,12:c=>`${c}11*'Assumptions'!${c}40`,13:c=>`${c}11-${c}12`,15:(c,p,i)=>i===0?"'Actuals'!H31-'Actuals'!H121":`${p}17`,16:c=>`MIN(${c}15,('Actuals'!$H$31-'Actuals'!$H$121)/'Assumptions'!${c}41)`,17:c=>`${c}15-${c}16`,18:(c,p,i)=>`(${i===0?'0':`SUM($I$12:${p}12)`}+${c}12/2)/'Assumptions'!${c}38`,19:(c,p,i)=>`(${i===0?'0':`SUM($I$13:${p}13)`}+${c}13/2)/'Assumptions'!${c}39`,20:c=>`SUM(${c}16,${c}18:${c}19)`,21:c=>`SUM(${c}20,${c}26)`,22:(c,p,i)=>i===0?"'Actuals'!H31":`${p}23`,23:c=>`${c}22+${c}11-${c}20`,25:(c,p,i)=>i===0?"'Actuals'!H35":`${p}27`,26:c=>`MIN(${c}25,'Actuals'!${c}128)`,27:c=>`${c}25-${c}26`,30:(c,p,i)=>i===0?"SUM('Actuals'!H44,'Actuals'!H53)":`${p}34`,31:c=>`'Actuals'!${c}127`,32:c=>`${c}30*'Assumptions'!${c}36`,33:c=>`MIN(${c}30,MAX(0,${c}31-${c}32))`,34:c=>`${c}30-${c}33`,35:(c,p,i)=>i===0?'0':`${p}38`,36:c=>`${c}9`,37:(c,p,i)=>`MIN(${c}35+${c}36,(${i===0?'0':`SUM($I$36:${p}36)`}+${c}36/2)/'Assumptions'!${c}42)`,38:c=>`SUM(${c}35:${c}36)-${c}37`,39:c=>`SUM(${c}34,${c}38)`,40:c=>`${c}32+(${c}35+${c}36/2-${c}37/2)*'Assumptions'!${c}36`,41:c=>`SUM(${c}33,${c}37)`,43:(c,p,i)=>`MIN(${c}39,MAX(0,'Actuals'!${i<4?fc[i+1]+'127':'M129'}-${c}34*'Assumptions'!${c}36)+SUM($I$36:${c}36)/'Assumptions'!${c}42)`,44:c=>`${c}39-${c}43`,47:(c,p,i)=>i===0?"'Actuals'!H32":`${p}50`,48:c=>`'Revenue'!${c}27*'Assumptions'!${c}18`,49:c=>`MIN(SUM(${c}47:${c}48),(${c}47+${c}48/2)/'Assumptions'!${c}43)`,50:c=>`SUM(${c}47:${c}48)-${c}49`,51:(c,p,i)=>i===0?"SUM('Actuals'!H51,'Actuals'!H120)":`${p}55`,52:c=>`(${c}51+${c}48/2)*'Assumptions'!${c}37`,53:c=>`SUM(${c}49,${c}52)`,54:c=>`${c}53`,55:c=>`SUM(${c}51,${c}48)-${c}49`,56:c=>`MIN(${c}55,${c}55/'Assumptions'!${c}43)`,57:c=>`${c}55-${c}56`};
for(const [r,fn]of Object.entries(cfns))forecasts('Capital',+r,fn);
for(const r of [7,11,20,21,23,27,39,41,44,50,54,55,57])total('Capital',r);percent('Capital',[6]);
note('Capital',11,'Cash capex + change in capital creditors + noncash finance-lease additions. No acquisitions or disposals assumed.');
note('Capital',16,'Existing net PP&E excluding land depreciates over an estimated eight remaining years.');
note('Capital',18,'Equipment and building additions use a half-year convention. No new cohort reaches retirement within FY2027–FY2031.');
note('Capital',26,'Source: disclosed amortization of existing acquired intangibles. No new acquired intangibles assumed.');
note('Capital',31,'Legacy lease payments are contractual. Legacy interest is estimated at the disclosed weighted-average rate.');
note('Capital',37,'New leases use an explicit straight-line principal proxy and half-year additions, not contract-level amortization.');
note('Capital',54,'Simplification: operating lease expense equals modeled cash rent. Lease additions are noncash.');

// Debt refinancing and capital-return policy. Cash interest uses opening cash to avoid circularity.
const fundLabels={7:'Corporate debt, opening',8:'Scheduled principal maturities',9:'Corporate debt refinanced',10:'Corporate debt, ending',11:'Previously refinanced principal',12:'Corporate debt interest',13:'Finance lease interest',14:'Total financing interest',15:'Interest income on opening liquid assets',17:'Basic shares, opening',18:'Assumed transaction share price',19:'Stock compensation expense',20:'Shares issued for stock compensation',21:'Cash proceeds from stock issuance',22:'Shares issued for cash proceeds',23:'Total shares issued',24:'Dividends paid',25:'Share repurchases',26:'Shares repurchased',27:'Basic shares, ending',28:'Weighted-average diluted shares',29:'Paid-in capital, opening',30:'Paid-in capital, ending',31:'Retained earnings, opening',32:'Retained earnings, ending',33:'Accumulated other comprehensive income'};
for(const [r,l]of Object.entries(fundLabels))row('Funding',+r,l);
const ffns={7:(c,p,i)=>i===0?"SUM('Actuals'!H45,'Actuals'!H47)":`${p}10`,8:c=>`'Actuals'!${c}126`,9:c=>`${c}8`,10:c=>`${c}7+${c}9-${c}8`,11:(c,p,i)=>i===0?'0':`SUM($I$9:${p}9)`,12:c=>`(${c}7-${c}11-${c}8/2)*'Assumptions'!${c}34+(${c}11+${c}8/2)*'DCF'!$D$11`,13:c=>`'Capital'!${c}40`,14:c=>`SUM(${c}12:${c}13)`,15:(c,p)=>`SUM('Statements'!${p}25:${p}26)*'Assumptions'!${c}32`,17:(c,p,i)=>i===0?"'Actuals'!H115":`${p}27`,18:(c,p,i)=>`${i===0?"'Actuals'!H110":p+'18'}*(1+'Assumptions'!${c}33)`,19:c=>`'Revenue'!${c}27*'Assumptions'!${c}20`,20:c=>`${c}19/${c}18`,21:c=>`'Assumptions'!${c}44`,22:c=>`${c}21/${c}18`,23:c=>`SUM(${c}20,${c}22)`,24:c=>`MAX(0,'Statements'!${c}20)*'Assumptions'!${c}30`,25:c=>`MAX(0,'Statements'!${c}20)*'Assumptions'!${c}31`,26:c=>`${c}25/${c}18`,27:c=>`${c}17+${c}23-${c}26`,28:c=>`AVERAGE(${c}17,${c}27)+'Assumptions'!${c}45`,29:(c,p,i)=>i===0?"'Actuals'!H56":`${p}30`,30:c=>`SUM(${c}29,${c}19,${c}21)`,31:(c,p,i)=>i===0?"'Actuals'!H57":`${p}32`,32:c=>`${c}31+'Statements'!${c}20-SUM(${c}24:${c}25)`,33:c=>"'Actuals'!$H$58"};
for(const [r,fn]of Object.entries(ffns))forecasts('Funding',+r,fn);for(const r of [10,14,23,27,28,30,32])total('Funding',r);sh.Funding.getRange('I18:M18').setNumberFormat(price);note('Funding',9,'All corporate debt maturities refinanced. No incremental corporate borrowing, buyback debt or cash sweeps.');note('Funding',20,'Economic dilution proxy: stock compensation divided by assumed transaction price. SBC is not added back in the DCF.');note('Funding',32,'All modeled repurchases reduce retained earnings. This presentation policy does not affect total equity or cash.');

// Linked forecast statements.
const sfns={7:c=>`'Revenue'!${c}27`,8:c=>`'Revenue'!${c}28`,9:c=>`${c}7-${c}8`,10:c=>`'Revenue'!${c}30*'Assumptions'!${c}12`,11:c=>`'Revenue'!${c}30*'Assumptions'!${c}13`,12:c=>`'Revenue'!${c}30*'Assumptions'!${c}14`,13:c=>`${c}9-SUM(${c}10:${c}12)`,14:c=>`${c}13/${c}7`,15:c=>`'Funding'!${c}15`,16:c=>`'Funding'!${c}14`,17:c=>'0',18:c=>`${c}13+${c}15-${c}16+${c}17`,19:c=>`${c}18*'Assumptions'!${c}15`,20:c=>`${c}18-${c}19`,21:c=>`'Funding'!${c}28`,22:c=>`${c}20/${c}21`,25:c=>`${c}97`,26:c=>"'Actuals'!$H$26",27:c=>`${c}7*'Assumptions'!${c}21/365`,28:c=>`${c}8*'Assumptions'!${c}22/365`,29:c=>`${c}7*'Assumptions'!${c}24`,30:c=>`SUM(${c}25:${c}29)`,31:c=>`'Capital'!${c}23`,32:c=>`'Capital'!${c}50`,33:c=>"'Actuals'!$H$33",34:c=>"'Actuals'!$H$34",35:c=>`'Capital'!${c}27`,36:c=>"'Actuals'!$H$36",37:c=>`SUM(${c}30:${c}36)`,39:c=>`${c}8*'Assumptions'!${c}23/365+'Capital'!${c}8`,40:c=>`${c}7*'Assumptions'!${c}25`,41:c=>`${c}19*'Assumptions'!${c}28`,42:c=>`${c}7*'Assumptions'!${c}26`,43:c=>`${c}7*'Assumptions'!${c}27+'Capital'!${c}56`,44:c=>`'Capital'!${c}43`,45:(c,p,i)=>i<4?`'Actuals'!${fc[i+1]}126`:'0',46:c=>`SUM(${c}39:${c}45)`,47:c=>`'Funding'!${c}10-${c}45`,48:c=>"'Actuals'!$H$48",49:c=>`${c}7*'Assumptions'!${c}29`,50:c=>"'Actuals'!$H$50",51:c=>`'Capital'!${c}57`,52:c=>"'Actuals'!$H$52",53:c=>`'Capital'!${c}44`,54:c=>`SUM(${c}46:${c}53)`,56:c=>`'Funding'!${c}30`,57:c=>`'Funding'!${c}32`,58:c=>`'Funding'!${c}33`,59:c=>`SUM(${c}56:${c}58)`,60:c=>`SUM(${c}54,${c}59)`,63:c=>`${c}20`,64:c=>`'Capital'!${c}21`,65:c=>`'Funding'!${c}19`,66:c=>'0',67:c=>`'Capital'!${c}49`,68:(c,p)=>`${p}27-${c}27`,69:(c,p)=>`${p}28-${c}28`,70:(c,p)=>`${p}29-${c}29`,71:(c,p)=>`${p}36-${c}36`,72:(c,p,i)=>`(${c}39-'Capital'!${c}8)-(${p}39-${i===0?"'Actuals'!H119":`'Capital'!${p}8`})`,73:(c,p)=>`SUM(${c}42,${c}49)-SUM(${p}42,${p}49)`,74:(c,p,i)=>`SUM(${c}40,${c}43)-'Capital'!${c}56-SUM(${p}40,${p}43)+${i===0?"'Actuals'!H120":`'Capital'!${p}56`}`,75:(c,p)=>`SUM(${c}41,${c}48)-SUM(${p}41,${p}48)`,76:(c,p)=>`${c}52-${p}52-'Capital'!${c}49`,77:c=>`SUM(${c}63:${c}76)`,79:c=>`-'Capital'!${c}7`,80:c=>'0',81:c=>'0',82:c=>'0',83:c=>`SUM(${c}79:${c}82)`,85:c=>`'Funding'!${c}9`,86:c=>`-'Funding'!${c}8`,87:c=>`'Funding'!${c}21`,88:c=>`-'Funding'!${c}25`,89:c=>`-'Funding'!${c}24`,90:c=>`-'Capital'!${c}41`,91:c=>'0',92:c=>`SUM(${c}85:${c}91)`,94:c=>'0',95:c=>`SUM(${c}77,${c}83,${c}92,${c}94)`,96:(c,p)=>`${p}25`,97:c=>`SUM(${c}95:${c}96)`,98:c=>`SUM(${c}77,${c}79)`,101:c=>`SUM(${c}27:${c}29)-(${c}39-'Capital'!${c}8)-SUM(${c}40:${c}42)-${c}49-(${c}43-'Capital'!${c}56)`};
for(const [r,fn]of Object.entries(sfns))forecasts('Statements',+r,fn);
f('Statements','H101',"SUM(H27:H29)-(H39-'Actuals'!H119)-SUM(H40:H42)-H49-(H43-'Actuals'!H120)");
note('Statements',16,'Forecast interest includes corporate debt and finance leases. Historical row is the reported other-income note.');
note('Statements',17,'Forecast excludes future investment gains, FX remeasurements and discrete other income.');
note('Statements',32,'Operating leases are operating costs. Finance lease assets are in PP&E and finance liabilities are debt for the DCF.');
note('Statements',45,'FY2031 current corporate debt assumes no FY2032 maturity. Total debt stays unchanged.');
note('Statements',64,'Actual cash-flow row includes other adjustments. Forecast uses explicit PP&E depreciation and scheduled intangible amortization.');
note('Statements',67,'Forecast: add back operating ROU amortization, then deduct matching operating lease principal in row 76.');
note('Statements',72,'Forecast excludes changes in capital purchases payable, which are classified with PP&E additions.');
note('Statements',101,'Includes current operating tax timing. Excludes cash, investments, capital creditors and both types of leases.');

// DCF: year-end discounting, an explicit first-year stub, and a normalized terminal return on capital.
sh.DCF.getRange('D5:H90').format.fill='#FFFFFF';sh.DCF.getRange('C1:C90').format.columnWidth=46;
const dl={6:'Risk-free rate',7:'Equity risk premium',8:'Beta',9:'Cost of equity',10:'Marginal corporate debt spread',11:'Marginal pretax cost of debt',12:'Normalized tax rate',13:'Market value of equity at observed price',14:'Debt and finance leases at valuation date',15:'Equity weight',16:'Calculated WACC',17:'WACC applied to DCF',18:'Terminal growth rate',19:'Terminal return on invested capital',20:'Valuation date',21:'Last reported fiscal year-end',22:'FY2027 forecast fiscal year-end',23:'Estimated FY2027 elapsed fraction',24:'FY2027 remaining fraction',26:'PV of five-year forecast cash flows',27:'PV of terminal value',28:'Enterprise value',29:'Estimated cash and short-term investments',30:'Estimated corporate debt',31:'Estimated finance lease liabilities',32:'Required operating cash reserve',33:'Nonoperating investments recognized',34:'Equity value',35:'Estimated diluted valuation shares',36:'DCF value per share',37:'Observed share price',38:'Implied upside / (downside)',39:'Terminal value / enterprise value',40:'Nonoperating investments / carrying value',41:'Operating cash reserve / FY2027 revenue'};
for(const [r,l]of Object.entries(dl))row('DCF',+r,l);
const df={6:"'Actuals'!H112",7:"'Actuals'!H113",8:"'Actuals'!H114",9:'D6+D8*D7',10:"'Assumptions'!I35",11:'SUM(D6,D10)',12:"'Assumptions'!M15",13:"D35*'Actuals'!H110",14:'SUM(D30:D31)',15:'D13/SUM(D13:D14)',16:'D9*D15+D11*(1-D12)*(1-D15)',17:'D16',23:'(D20-D21)/(D22-D21)',24:'1-D23',26:'SUM(I19:M19)',27:'M29',28:'SUM(D26:D27)',29:"SUM('Statements'!H25:H26)+D23*('Statements'!I25-'Statements'!H25)",30:"SUM('Statements'!H45,'Statements'!H47)+D23*('Funding'!I10-SUM('Statements'!H45,'Statements'!H47))",31:"SUM('Statements'!H44,'Statements'!H53)+D23*('Capital'!I39-SUM('Statements'!H44,'Statements'!H53))",32:"'Statements'!I7*D41",33:"'Statements'!H33*D40",34:'D28+D29-SUM(D30:D32)+D33',35:"'Actuals'!H115+D23*('Funding'!I27-'Actuals'!H115)+'Actuals'!H116",36:'D34/D35',37:"'Actuals'!H110",38:'D36/D37-1',39:'D27/D28'};
for(const [r,x]of Object.entries(df))f('DCF','D'+r,x);
for(const [r,x]of [[18,.03],[19,.20],[40,1],[41,.01]]){v('DCF','D'+r,x);sh.DCF.getRange('D'+r).format={font:{color:blue},fill:amber};}
for(const [r,date]of [[20,'2026-10-26'],[21,'2026-06-30'],[22,'2027-06-30']]){v('DCF','D'+r,new Date(date+'T00:00:00Z'));sh.DCF.getRange('D'+r).setNumberFormat('mm/dd/yy');}
for(const r of [6,7,9,10,11,12,15,16,17,18,19,23,24,38,39,40,41])sh.DCF.getRange('D'+r).setNumberFormat(pct);
for(const r of [36,37])sh.DCF.getRange('D'+r).setNumberFormat(price);
for(const r of [16,17,28,34,36]){sh.DCF.getRange(`C${r}:D${r}`).format={font:{bold:true},borders:{top:{style:'thin',color:'#A9B6C2'}}};}
const cashLabels={7:'Operating income',8:'Normalized operating tax',9:'After-tax operating profit',10:'Depreciation and acquired amortization',11:'Cash capital expenditure',12:'Noncash finance-lease asset additions',13:'Change in operating working capital',14:'Unlevered free cash flow',15:'Portion after valuation date',16:'Cash flow after valuation date',17:'Years to fiscal year-end',18:'Discount factor',19:'Present value of free cash flow',22:'Terminal-year revenue',23:'Terminal operating margin',24:'Terminal operating profit',25:'Terminal after-tax operating profit',26:'Terminal net reinvestment',27:'Terminal unlevered free cash flow',28:'Undiscounted terminal enterprise value',29:'Present value of terminal value'};
for(const[r,l]of Object.entries(cashLabels))v('DCF','H'+r,l);
sh.DCF.getRange('H5:H41').format.columnWidth=43;sh.DCF.getRange('I5:M41').format.columnWidth=15;
const dcfFns={7:c=>`'Statements'!${c}13`,8:c=>`-${c}7*'Assumptions'!${c}15`,9:c=>`SUM(${c}7:${c}8)`,10:c=>`'Capital'!${c}21`,11:c=>`-'Capital'!${c}7`,12:c=>`-'Capital'!${c}9`,13:(c,p)=>`'Statements'!${p}101-'Statements'!${c}101`,14:c=>`SUM(${c}9:${c}13)`,15:(c,p,i)=>i===0?'$D$24':'1',16:c=>`${c}14*${c}15`,17:(c,p,i)=>`(DATE(${2027+i},6,30)-$D$20)/365.25`,18:c=>`(1+$D$17)^(-${c}17)`,19:c=>`${c}16*${c}18`};
for(const [r,fn]of Object.entries(dcfFns))forecasts('DCF',+r,fn);
for(const[r,x]of Object.entries({22:"'Statements'!M7*(1+$D$18)",23:"'Statements'!M13/'Statements'!M7",24:'M22*M23',25:'M24*(1-$D$12)',26:'M25*$D$18/$D$19',27:'M25-M26',28:'IF($D$17>$D$18,M27/($D$17-$D$18),NA())',29:'M28*M18'}))f('DCF','M'+r,x);
for(const r of [9,14,19,27,29])sh.DCF.getRange(`H${r}:M${r}`).format={font:{bold:true},borders:{top:{style:'thin',color:'#A9B6C2'}}};
for(const r of [15,18,23])sh.DCF.getRange(`I${r}:M${r}`).setNumberFormat(pct);sh.DCF.getRange('I17:M17').setNumberFormat('0.00');
v('DCF','C43','Value per share sensitivity');v('DCF','C44','Rows: WACC. Columns: terminal growth.');
f('DCF','F45','$D$36');sh.DCF.getRange('F45').setNumberFormat(';;;');
sh.DCF.getRange('G45:K45').formulas=[[-.01,-.005,0,.005,.01].map(x=>`=$D$18+${x}`)];
sh.DCF.getRange('F46:F50').formulas=[-.01,-.005,0,.005,.01].map(x=>[`=$D$17+${x}`]);
sh.DCF.dataTables.add('F45:K50',{rowInput:'D18',columnInput:'D17'});
sh.DCF.getRange('G45:K45').setNumberFormat(pct);sh.DCF.getRange('F46:F50').setNumberFormat(pct);sh.DCF.getRange('G46:K50').setNumberFormat(price);
sh.DCF.getRange('F45:K45').format={fill:navy,font:{color:'#FFFFFF',bold:true}};sh.DCF.getRange('F46:F50').format.font.bold=true;sh.DCF.getRange('I48').format.fill=amber;
note('DCF',6,'Source rates and price are frozen to the collected October 26, 2026 research snapshot.');
note('DCF',17,'Linked to calculated WACC. Data table varies this cell directly. Restore =D16 after manual WACC tests.');
note('DCF',19,'Analyst terminal ROIC: 20%. Net reinvestment = terminal NOPAT × growth / ROIC.');
note('DCF',23,'Elapsed fraction rolls June 30 balances and shares to October 26 using FY2027 forecast changes.');
note('DCF',24,'Only remaining FY2027 FCF is valued. Cash flows assumed uniform within FY2027 and paid at fiscal year-end.');
note('DCF',29,'Estimated valuation-date bridge, not newly reported balances. Investment and debt book values are proxies for market value.');
note('DCF',31,'Finance leases deducted as debt. Operating rent remains in operating income and operating leases are not deducted again.');
note('DCF',33,'Nonoperating investments included at carrying value × the editable recognition factor in D40. No future gains forecast.');
note('DCF',35,'Forecast basic shares rolled to valuation date plus 24m incremental diluted shares. Not an award-level valuation.');
note('DCF',38,'Difference from the observed price under these assumptions, not a prediction of the trading price.');
note('DCF',40,'Use a lower factor to test private-investment valuation uncertainty. Avoid counting investment gains in operating FCF.');
note('DCF',43,'Native Excel two-variable What-If Data Table. Automatic calculation must include data tables.');
note('DCF',54,'Stock compensation remains an operating expense in unlevered FCF. Future dilution affects EPS, but no SBC addback inflates DCF.');

// Main output: five-year forecast plus source-linked valuation and a native chart.
for(const r of [6,7,8,9,10,11,13,14,15])row('Overview',r,({6:'Revenue',7:'Revenue growth',8:'Operating income',9:'Operating margin',10:'Net income',11:'Diluted EPS',13:'Cash from operations',14:'Cash capital expenditure',15:'Unlevered free cash flow'})[r]);
for(const c of cols){for(const [r,s,sr]of [[6,'Statements',7],[8,'Statements',13],[9,'Statements',14],[10,'Statements',20],[11,'Statements',22],[13,'Statements',77],[14,'Statements',79]])f('Overview',c+r,`${r===14?'-':''}'${s}'!${c}${sr}`);if(c!=='D')f('Overview',c+'7',`${c}6/${cols[cols.indexOf(c)-1]}6-1`);if(fc.includes(c))f('Overview',c+'15',`'DCF'!${c}14`);}
percent('Overview',[7,9]);sh.Overview.getRange('D11:M11').setNumberFormat(price);sh.Overview.getRange('D5:M90').format.font.color=ink;
for(const[r,l,ref]of [[19,'DCF value per share','D36'],[20,'Observed share price','D37'],[21,'Implied upside / (downside)','D38'],[23,'WACC','D17'],[24,'Terminal growth','D18'],[25,'Terminal return on invested capital','D19'],[26,'Terminal value / enterprise value','D39']]){row('Overview',r,l);f('Overview','D'+r,`'DCF'!${ref}`);}
for(const r of [19,20])sh.Overview.getRange('D'+r).setNumberFormat(price);for(const r of [21,23,24,25,26])sh.Overview.getRange('D'+r).setNumberFormat(pct);
sh.Overview.getRange('C19:D21').format={fill:'#E6EEF5',font:{bold:true,color:navy},rowHeight:25};
v('Overview','C29','Begin with Assumptions. Change blue inputs, then review Statements, DCF and Checks.');
v('Overview','C31','Base-case forecast. Management guidance and analyst estimates are identified beside the assumptions.');
v('Overview','C33','Valuation date: October 26, 2026. FY2027 Q1 results are scheduled for October 28 and are not included.');
v('Overview','C35','Terminal cash flow uses sustainable reinvestment at 20% ROIC, rather than extending a temporary capex trough.');
v('Overview','C37','Cash capex and finance-lease additions both reduce DCF cash flow. Stock compensation is kept as an expense.');
v('Overview','C39','The net-debt bridge uses forecast-based estimates between the last reported balance sheet and the valuation date.');
sh.Overview.getRange('I54:K54').values=[['Fiscal year','Revenue','Unlevered FCF']];
for(let i=0;i<5;i++){v('Overview','I'+(55+i),`FY:${27+i}`);f('Overview','J'+(55+i),`'Statements'!${fc[i]}7`);f('Overview','K'+(55+i),`'DCF'!${fc[i]}14`);}
const chart=sh.Overview.charts.add('line',sh.Overview.getRange('I54:K59'));chart.title='Revenue and unlevered cash flow (USD billions)';chart.titleTextStyle.typeface='Arial';chart.titleTextStyle.fontSize=12;chart.legend={position:'top',textStyle:{typeface:'Arial',fontSize:10}};chart.xAxis={axisType:'textAxis',textStyle:{typeface:'Arial',fontSize:10}};chart.yAxis={numberFormatCode:'0.0,"bn"',numberFormatSourceLinked:false,textStyle:{typeface:'Arial',fontSize:10}};chart.series.items[0].line={fill:navy,style:'solid',width:2};chart.series.items[1].line={fill:'#D48326',style:'solid',width:2};chart.setPosition('F18','N28');
for(const r of [6,8,10,13,15])total('Overview',r);

// Independent model checks. No other tab refers to this terminal audit area.
const checks=[
['Balance sheet: assets less liabilities and equity',(c)=>`'Statements'!${c}37-'Statements'!${c}60`],
['Cash flow ending cash less balance-sheet cash',c=>`'Statements'!${c}97-'Statements'!${c}25`],
['Income statement: pretax less tax less net income',c=>`'Statements'!${c}18-'Statements'!${c}19-'Statements'!${c}20`],
['Cash flow: beginning + change less ending',c=>`SUM('Statements'!${c}95:${c}96)-'Statements'!${c}97`],
['Cash flow: total operating adjustments less CFO',c=>`SUM('Statements'!${c}63:${c}76)-'Statements'!${c}77`],
['Forecast segment operating income less statement',c=>`'Revenue'!${c}31-'Statements'!${c}13`,true],
['PP&E: opening + additions - depreciation - closing',c=>`'Capital'!${c}22+'Capital'!${c}11-'Capital'!${c}20-'Statements'!${c}31`,true],
['Finance leases: opening + new - principal - closing',(c,p,i)=>`${i===0?"SUM('Actuals'!H44,'Actuals'!H53)":`'Capital'!${p}39`}+'Capital'!${c}9-'Capital'!${c}41-SUM('Statements'!${c}44,'Statements'!${c}53)`,true],
['Corporate debt: opening + issued - repaid - closing',c=>`'Funding'!${c}7+'Funding'!${c}9-'Funding'!${c}8-SUM('Statements'!${c}45,'Statements'!${c}47)`,true],
['Equity: opening + NI + SBC + issuance - distributions',(c,p)=>`'Statements'!${p}59+'Statements'!${c}20+'Statements'!${c}65+'Statements'!${c}87+'Statements'!${c}88+'Statements'!${c}89-'Statements'!${c}59`,true],
['Operating expense allocation less 100%',c=>`SUM('Assumptions'!${c}12:${c}14)-1`,true],
['Funding shortfall: negative cash',c=>`MIN(0,'Statements'!${c}25)`,true],
['Working capital change ties to cash flow',c=>`'DCF'!${c}13-SUM('Statements'!${c}68:'Statements'!${c}75)`,true],
['SBC not added back in DCF: cash-flow bridge',(c)=>`'DCF'!${c}14-('Statements'!${c}77-'Statements'!${c}65+('Statements'!${c}16-'Statements'!${c}15)*(1-'Assumptions'!${c}15)-'Capital'!${c}7-'Capital'!${c}9)`,true],
['Basic shares: opening + issued - repurchased - ending',c=>`'Funding'!${c}17+'Funding'!${c}23-'Funding'!${c}26-'Funding'!${c}27`,true]
];
checks.forEach(([l,fn,only],i)=>{row('Checks',6+i,l);for(const c of (only?fc:cols)){const idx=fc.indexOf(c);f('Checks',c+(6+i),fn(c,cols[cols.indexOf(c)-1],idx));}});
row('Checks',23,'DCF sensitivity center less base value');
row('Checks',24,'WACC must exceed terminal growth (1 = valid)');f('Checks','I24',"IF('DCF'!D17>'DCF'!D18,1,0)");
row('Checks',25,'Terminal ROIC must exceed growth (1 = valid)');f('Checks','I25',"IF('DCF'!D19>'DCF'!D18,1,0)");
sh.Checks.getRange('D6:M23').setNumberFormat('0.00;(0.00);0.00');sh.Checks.getRange('D6:M25').format.font.color=ink;
sh.Checks.getRange('D6:M23').conditionalFormats.addCustom('ABS(D6)>0.01',{fill:'#FCE4D6',font:{bold:true,color:'#C00000'}});
sh.Checks.getRange('I24:I25').conditionalFormats.add('cellIs',{operator:'notEqual',formula:1,format:{fill:'#FCE4D6',font:{bold:true,color:'#C00000'}}});
v('Checks','C28','Differences must be 0.00. Economic conditions in rows 24–25 must equal 1.');
v('Checks','C30','Negative cash requires a funding-policy change. No unexplained debt or equity balancing plug is used.');
v('Checks','C32','Historical sources retain reported acquisition, FX and other adjustments. Forecast assumes these are zero.');

// User walkthrough, stored inside Excel for future reference.
const guide=[
['1. Read the overview','Revenue, profits, cash flows and value update when assumptions change. Amounts are USD millions.'],
['2. Review the assumptions','The blue inputs on Assumptions are analyst choices. Yellow fill identifies editable forecast inputs.'],
['Revenue growth','Agents and Infra grows 25%, 22%, 19%, 16%, then 13%. Consumer grows 1%, 3%, 4%, 4%, then 3%.'],
['Margins','Cash gross margins exclude depreciation and operating rent. Capital calculates both costs and Revenue deducts them.'],
['Operating expenses','Segment expense ratios decline slowly. R&D, sales/marketing and G&A follow the FY2026 consolidated cost mix.'],
['Cash investment','Cash capex is 42%, 37%, 32%, 28%, then 25% of sales. These are assumptions, not company guidance.'],
['Capital purchases payable','Asset additions include capital purchases still unpaid. Capital creditors are excluded from operating working capital.'],
['Depreciation','Opening depreciable PP&E runs off over an assumed eight years. New equipment uses six years, buildings 25, with half-year additions.'],
['Operating leases','New operating leases rise with sales. ROU assets and liabilities roll forward and cash rent is an operating expense.'],
['Finance leases','New finance leases add PP&E and financing debt. Principal is a financing cash outflow. DCF deducts the asset additions.'],
['Working capital','Receivable, inventory and trade payable days use FY2026 ratios. Other operating balances generally scale with revenue.'],
['Tax and other income','Tax is 20%. No future one-time investment gains, acquisitions or FX effects are assumed.'],
['Financing','Corporate maturities are refinanced. Opening liquid assets earn 4%. Debt interest and share prices have separate assumptions.'],
['Capital returns','Dividends use 20% of positive net income and repurchases 15%. Change them if the model requires more funding.'],
['Stock compensation','SBC stays in operating expenses. Cash flow adds it back and shares increase. DCF does not add it back.'],
['3. Follow the statements','Net income, noncash charges and working capital determine CFO. CFO, investing and financing determine cash.'],
['4. Review the DCF','Unlevered cash flow is after-tax operating profit + D&A - cash capex - finance-lease additions - working-capital investment.'],
['Discount rate','Cost of equity uses a 5% Treasury, historical beta and 4.46% ERP. Debt includes finance leases. WACC uses market equity weights.'],
['Valuation timing','Only post-October 26 FY2027 FCF is included. Year-end discounting is used. June balances are rolled with the forecast stub.'],
['Terminal value','Terminal growth is 3%. Terminal ROIC is 20%. Growth requires reinvestment equal to NOPAT × growth / ROIC.'],
['Equity bridge','Add estimated cash, short-term and nonoperating investments, less operating cash reserve, corporate debt and finance leases.'],
['Sensitivity','The DCF tab contains a native What-If Data Table varying WACC and terminal growth. It uses the same valuation formula.'],
['5. Check the model','Review Checks after every change. Differences must be zero, cash must not be negative, and WACC must exceed terminal growth.'],
['Model simplifications','This annual model uses aggregate asset lives and lease schedules. It does not forecast acquisitions, disposals or award-level dilution.'],
['Private investments','Carrying value is not necessarily fair value. DCF D40 lets you test the amount recognized in the equity bridge.'],
['Cash timing','Even FY2027 cash-flow timing is assumed. Debt, cash and shares on the valuation date are estimates, not a new reported balance sheet.'],
['Before the next refresh','FY2027 Q1 results are scheduled for October 28, 2026. Replace the stub with reported results when available.'],
['Source: annual report',arurl],['Source: segment recast',recasturl],['Source: Treasury',input.manifest.find(x=>x.id==='treasury_2026').url],['Source: ERP',input.manifest.find(x=>x.id==='equity_risk_premium').url],['Quote timestamp',input.valuation.msft_quote.timestamp_utc+' UTC; original quote $530.17.']
];
sh.Guide.getRange('D5:M90').format.fill='#FFFFFF';sh.Guide.getRange('D5:D90').format.columnWidth=135;
guide.forEach(([l,t],i)=>{v('Guide','C'+(6+i*2),l);v('Guide','D'+(6+i*2),t);sh.Guide.getRange('C'+(6+i*2)).format.font.bold=true;});
for(const s of names){if(!['Overview','DCF','Guide'].includes(s)){
 const used=sh[s].getUsedRange();const forms=used.formulas;const vals=used.values;
 // Numeric inputs are blue, local calculations black, cross-sheet formulas green.
 for(let r=0;r<forms.length;r++)for(let c=0;c<(forms[r]?.length??0);c++){const formula=forms[r][c];if(formula)used.getCell(r,c).format.font.color=formula.includes('!')?green:ink;}
 } }
sh.Checks.getRange('D6:M25').format.font.color=ink;
// Restrict actual shading to actual content and make current-year anchors useful on supporting schedules.
sh.Overview.getRange('D16:H90').format.fill='#FFFFFF';
for(const s of ['Assumptions','Revenue','Capital','Funding']){
 sh[s].getRange('D5:G90').format.fill='#FFFFFF';
 if(s!=='Revenue')sh[s].getRange('D4:G4').values=[[null,null,null,null]];
}
sh.Revenue.getRange('D4:F4').values=[[null,null,null]];
for(const [r,expr]of Object.entries({7:"-'Actuals'!H79",8:"'Actuals'!H119",9:"'Actuals'!H134",20:"'Actuals'!H117",21:"SUM('Actuals'!H117:H118)",23:"'Actuals'!H31",27:"'Actuals'!H35",39:"SUM('Actuals'!H44,'Actuals'!H53)",40:"'Actuals'!H139",41:"-'Actuals'!H90",43:"'Actuals'!H44",44:"'Actuals'!H53",50:"'Actuals'!H32",54:"'Actuals'!H136",55:"SUM('Actuals'!H120,'Actuals'!H51)",56:"'Actuals'!H120",57:"'Actuals'!H51"}))f('Capital','H'+r,expr);
for(const [r,expr]of Object.entries({10:"'Actuals'!H122",19:"'Actuals'!H65",21:"'Actuals'!H87",24:"-'Actuals'!H89",25:"-'Actuals'!H88",27:"'Actuals'!H115",28:"'Actuals'!H21",30:"'Actuals'!H56",32:"'Actuals'!H57",33:"'Actuals'!H58"}))f('Funding','H'+r,expr);
for(const s of ['Capital','Funding'])sh[s].getRange('H5:H90').format.fill='#F3F0E9';
for(const s of ['Capital','Funding','DCF']){
 const used=sh[s].getUsedRange();const forms=used.formulas;
 for(let r=0;r<forms.length;r++)for(let c=0;c<(forms[r]?.length??0);c++)if(forms[r][c])used.getCell(r,c).format.font.color=forms[r][c].includes('!')?green:ink;
}
sh.DCF.getRange('D26:D39').format.font.color=ink;sh.DCF.getRange('G46:K50').format.font.color=ink;
sh.Checks.getRange('C1:C90').format.columnWidth=72;
for(const r of [21,22,23,38,39,41,42,43])sh.Assumptions.getRange(`D${r}:M${r}`).setNumberFormat('0.0');
for(const r of [38,39,41,42,43])sh.Assumptions.dataValidations.add({range:`I${r}:M${r}`,rule:{type:'whole',operator:'between',formula1:1,formula2:50}});
for(const r of [16,17])sh.DCF.getRange('D'+r).setNumberFormat('0.00%');sh.Overview.getRange('D23').setNumberFormat('0.00%');
sh.DCF.getRange('F46:F50').setNumberFormat('0.00%');
sh.DCF.getRange('D4:H4').values=[[null,null,null,null,null]];v('DCF','C4','VALUATION INPUTS');
sh.Guide.getRange('C4:M4').values=[[null,null,null,null,null,null,null,null,null,null,null]];sh.Guide.getRange('C4:M4').format.fill='#FFFFFF';
note('Funding',14,'All modeled debt and finance lease interest is expensed. No interest capitalization is assumed.');
for(const s of ['Statements','Revenue','Capital','Funding'])for(const r of [7,13,20,25,30,37,46,54,59,60,77,83,92,95,97,98]){if(s==='Statements')sh[s].getRange(`D${r}:M${r}`).setNumberFormat(usd);}
wb.recalculate();
console.log((await wb.inspect({kind:'region',sheetId:'DCF',range:'C26:D40',maxChars:3500,tableMaxRows:16,tableMaxCols:2})).ndjson);
const testReport=[];
function requireClose(label,x,y,tol=.01){if(typeof x!=='number'||Math.abs(x-y)>tol)throw new Error(`${label}: ${x} versus ${y}`);testReport.push({label,value:x,expected:y});}
for(let r=6;r<6+checks.length;r++)for(const c of (checks[r-6][2]?fc:cols))requireClose(`Checks!${c}${r}`,sh.Checks.getRange(c+r).values[0][0],0);
requireClose('Sensitivity center',sh.DCF.getRange('I48').values[0][0],sh.DCF.getRange('D36').values[0][0]);
for(const [cell,rate,growth]of [['G46',-.01,-.01],['K50',.01,.01]]){
 const baseRate=sh.DCF.getRange('D17').values[0][0],baseGrowth=sh.DCF.getRange('D18').values[0][0],tableValue=sh.DCF.getRange(cell).values[0][0];
 v('DCF','D17',baseRate+rate);v('DCF','D18',baseGrowth+growth);wb.recalculate();requireClose(`Sensitivity corner ${cell}`,sh.DCF.getRange('D36').values[0][0],tableValue);f('DCF','D17','D16');v('DCF','D18',baseGrowth);wb.recalculate();
}
// Meaningful driver-change check: higher growth must propagate through the same statements and valuation.
const originalGrowth=sh.Assumptions.getRange('I6').values[0][0],baseRevenue=sh.Statements.getRange('I7').values[0][0],baseValue=sh.DCF.getRange('D36').values[0][0];
v('Assumptions','I6',originalGrowth+.01);wb.recalculate();const testRevenue=sh.Statements.getRange('I7').values[0][0],testValue=sh.DCF.getRange('D36').values[0][0];
if(!(testRevenue>baseRevenue)||testValue===baseValue)throw new Error('Growth driver did not update outputs');
for(const c of fc)requireClose(`Changed growth balance ${c}`,sh.Checks.getRange(c+'6').values[0][0],0);
v('Assumptions','I6',originalGrowth);wb.recalculate();requireClose('Base restored',sh.DCF.getRange('D36').values[0][0],baseValue);
// Create this dependent check after all table change-and-restore tests are settled.
f('Checks','I23',"'DCF'!I48-'DCF'!D36");wb.recalculate();requireClose('Final sensitivity check after restoring drivers',sh.Checks.getRange('I23').values[0][0],0);
for(let r=6;r<6+checks.length;r++)for(const c of (checks[r-6][2]?fc:cols))requireClose(`Final Checks!${c}${r}`,sh.Checks.getRange(c+r).values[0][0],0);
const errors=[];for(const s of names){const a=sh[s].getUsedRange().values;for(let r=0;r<a.length;r++)for(let c=0;c<a[r].length;c++)if(typeof a[r][c]==='string'&&/^#(REF!|DIV\/0!|VALUE!|NUM!|NAME\?|N\/A|SPILL!|CALC!)/.test(a[r][c]))errors.push([s,r+1,c+1,a[r][c]]);}
if(errors.length)throw new Error('Formula errors '+JSON.stringify(errors));
await fs.writeFile(path.join(out,'verification.json'),JSON.stringify({checks:testReport.length,passed:testReport.length,errors,baseFairValue:baseValue,forecast:fc.map((c,i)=>({year:2027+i,revenue:sh.Statements.getRange(c+'7').values[0][0],ebit:sh.Statements.getRange(c+'13').values[0][0],netIncome:sh.Statements.getRange(c+'20').values[0][0],cash:sh.Statements.getRange(c+'25').values[0][0],fcf:sh.DCF.getRange(c+'14').values[0][0]})),wacc:sh.DCF.getRange('D17').values[0][0],terminalShare:sh.DCF.getRange('D39').values[0][0],upside:sh.DCF.getRange('D38').values[0][0]},null,2));
const xlsx=await SpreadsheetFile.exportXlsx(wb);await xlsx.save(path.join(out,'Microsoft_Five_Year_Model.xlsx'));
for(const [s,range]of [['Overview','C2:N39'],['Assumptions','C4:M27'],['DCF','C26:M50'],['Statements','C6:M22'],['Checks','C4:M25'],['Capital','C4:M27']]){
 try{const preview=await wb.render({sheetName:s,range,scale:1.3,format:'png'});await fs.writeFile(path.join(out,s.toLowerCase()+'.png'),new Uint8Array(await preview.arrayBuffer()));}catch(e){console.log('RENDER ERROR',s,e.message);}
}
console.log('EXPORTED',path.join(out,'Microsoft_Five_Year_Model.xlsx'));console.log(await fs.readFile(path.join(out,'verification.json'),'utf8'));
