# Microsoft financial model — research inputs

Research cutoff: **October 26, 2026**. Currency: USD. Microsoft's fiscal year ends June 30; FY2026 covers July 1, 2025–June 30, 2026.

This repository contains historical research inputs and an illustrative annual three-statement forecast and discounted cash flow (DCF) valuation. The Excel model forecasts FY2027–FY2031, keeping reported historical facts separate from editable analyst assumptions.

## Excel model

The completed illustrative model is [Microsoft_Five_Year_Model.xlsx](outputs/msft-model/Microsoft_Five_Year_Model.xlsx). It contains FY2022–FY2026 actuals, a linked FY2027–FY2031 forecast, capital and lease schedules, debt and share schedules, a DCF, a native two-variable sensitivity table, and a Guide worksheet explaining the assumptions. See [the model walkthrough](docs/model-walkthrough.md).

The initial base case estimates $355.12 per share at October 26, 2026, using 9.55% WACC and 3% terminal growth. This is an analyst-assumption output, not a reported company value. The statement and scenario checks pass, including changing a revenue driver and restoring the base case. The source package below remains an unchanged historical research foundation.

## What we need, and why

| Inputs | Purpose | Acquired location |
|---|---|---|
| Five years of income statements | Forecast sales, expenses, earnings and tax | `data/processed/historical_statements.csv` — FY2022–FY2026, plus FY2021 opening balances/comparatives where available |
| Balance sheets | Forecast working capital, invested assets, debt and equity | Same file; full annual reports retained |
| Cash flow statements | Link earnings to cash, capital spending, financing and ending cash | Same file |
| Segment revenue, costs and operating income | Build the sales and profitability forecast by business | `data/processed/recast_segments.csv`; FY2025–FY2026 on the FY2027 reporting basis, quarterly and annual |
| Product revenue, geographic revenue and operating metrics | Understand business drivers and check growth assumptions | Annual-report tables; `data/raw/fy26q4_metrics.html`; FY2027 segment presentation |
| Capital spending, depreciation, asset lives and leases | Forecast infrastructure investment and depreciation | Annual reports: property/equipment and lease notes; earnings transcript; outlook |
| Receivables, inventory, payables, deferred revenue and accruals | Forecast operating working capital | Balance sheets, cash flows and notes |
| Debt maturities, coupons, interest, investments and lease liabilities | Forecast financing and bridge enterprise value to equity value | Annual reports: debt, investment, other income and lease notes |
| Taxes and unusual gains/charges | Separate recurring operating performance from unusual items | Tax/other income notes, Q4 release and transcript |
| Share counts, stock compensation, dividends and buybacks | Forecast dilution and derive value per share | Statements and equity/employee compensation notes; SEC facts |
| Management guidance and current business changes | Anchor near-term assumptions | Original transcript and outlook slides; September 2 segment update |
| Share price and market return history | Compare price to value and estimate market risk | `data/processed/market_prices.csv`, `valuation_inputs.json`, `calculated_beta.json` |
| Risk-free rate, equity risk premium and beta reference | Estimate the cost of equity | Treasury and Damodaran raw snapshots; valuation inputs and calculated beta |
| Growth, margins, normalized tax, reinvestment, debt spread and terminal assumptions | Turn history into a forecast and DCF | Analyst decisions: see `docs/modeling-guide.md`; these are not reported historical facts |

## Start here

1. Read `docs/modeling-guide.md` for the modeling sequence and Microsoft-specific issues.
2. Open the **original Microsoft spreadsheet**, `data/raw/fy26q4_financials.xlsx`, for the latest company-formatted statements. It is downloaded unchanged, not a model created by this project.
3. Import `historical_statements.csv`, `historical_drivers.csv`, and `recast_segments.csv` into your modeling workbook. CSV files are UTF-8 with a BOM for Excel compatibility.
4. Use `data/source_manifest.json` to trace documents to their URLs, download times and SHA-256 checksums. Tidy statement rows also carry report ID, URL and zero-based table/row indexes.
5. Keep actuals and assumptions separate, then build the forecast. Do not treat an empty valuation assumption as zero.

## Files and provenance

- `data/raw/`: five annual reports (2022–2026), SEC company facts and submission history, latest earnings release, operating metrics, original statement workbook, transcript, outlook, FY2027 segment update, market history and discount-rate references.
- `data/processed/historical_statements.csv`: consolidated statements, choosing the newest available report for each year. Values are USD millions, except EPS (USD/share) and weighted-average shares (millions). Context disambiguates repeated labels such as Basic and Diluted.
- `data/processed/recast_segments.csv`: FY2025–FY2026 segment data as recast for FY2027. Do not join older segment histories without reconciling their definition changes.
- `data/processed/annual_report_numeric_rows.csv`: unambiguous annual numeric rows across statement and note tables, with their original row labels and context. Its unit description is deliberately broad: consult each source table before using note ratios, share counts or per-share amounts.
- `data/processed/source_table_rows.csv` and `*_tables.json`: source table cells, including note schedules that do not fit the tidy annual schema. Indexes are zero-based; cells are stored as JSON to preserve their original grouping.
- `data/processed/sec_facts.csv`: 32,711 SEC observations filed on or before the cutoff, including quarterly and annual filings. SEC amounts retain their native units, often **USD rather than USD millions**. Repeated facts are filing observations, not additive data; select by period, form, filing date and accession. Segment dimensions are supplied separately from the published presentation.
- `data/processed/*_text.txt`: readable text from HTML reports and the Word transcript. The original outlook slides are image-based; their text file flags that limitation. Open the original PowerPoint or use the updated outlook in the SEC segment presentation. Slide XML file order may differ from numerical slide order; slide names are retained.
- `data/processed/validation.csv`: 47 reconciliation checks; all pass for this snapshot. These check internal arithmetic, not every note's extraction or accounting interpretation.

## Market-data conventions

The share price is a timestamped intraday/delayed quote, not an asserted closing price. The risk-free rate is the latest available Treasury observation on or before the cutoff. Damodaran's equity risk premium is a published estimate whose update vintage should be reviewed in the retained source; it is not a daily market quote.

The calculated beta uses 58 monthly returns through September 2026, excluding October's incomplete bar. It is the OLS slope of MSFT adjusted-close returns against the S&P 500 price index. That benchmark excludes dividends and the sample is slightly shorter than 60 returns; use this as a transparent reference estimate, not a definitive beta. Industry beta data is also retained. Final WACC, terminal growth and marginal debt spread remain explicitly unset analytical choices.

## Reproduce and refresh

Python 3, standard library only:

```sh
python scripts/acquire.py
python scripts/prepare.py
```

Acquisition reuses successful downloads and retries failures; this preserves the research snapshot. For a new valuation date, archive the old dataset, update the script cutoff and source years, and intentionally remove the relevant cached manifest entries before downloading. `prepare.py` also contains the fixed cutoff and year range; update both scripts together. Yahoo and Damodaran endpoints are live and cannot recreate an old snapshot; retain the committed raw files. SEC access may require replacing the research User-Agent contact with your real contact address. Failed requests are recorded rather than silently filled with estimates.

Original sources retain their publishers' rights. No license to redistribute their content is implied. This repository is private by default.
