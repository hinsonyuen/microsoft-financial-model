# Microsoft five-year forecast and DCF

Open `outputs/msft-model/Microsoft_Five_Year_Model.xlsx`. Start with **Overview**, then **Assumptions**. The **Guide** worksheet contains a step-by-step explanation inside Excel. Blue numbers in pale yellow are editable assumptions. Green formulas link to another worksheet. All financial amounts are USD millions, shares are millions, and per-share prices are USD/share.

## 1. Revenue

The annual forecast runs from FY2027 through FY2031. Agents and Infra revenue grows 25%, 22%, 19%, 16%, and 13%. Devices and Consumer grows 1%, 3%, 4%, 4%, and 3%. These are analyst estimates based on the collected history and business context. They are not management's five-year guidance. The model uses the September 2026 recast, keeping segment definitions consistent.

Revenue grows from $331.8bn in FY2026 to $399.5bn in FY2027 and $711.7bn in FY2031. Change Assumptions I6:M7 to test a different growth path.

## 2. Operating profit and taxes

The Revenue worksheet forecasts segment cash gross profit before depreciation and operating rent, deducts those costs from Capital, and subtracts segment operating expenses. This avoids a depreciation schedule that never affects earnings. Historical cash margins are calibration estimates, using an explicit allocation of depreciation, amortization and rent; the reported segment profit is retained as a control.

Cash gross margins gradually improve, while operating expense ratios decline. Despite those improvements, infrastructure depreciation keeps consolidated operating margins around 45%–46%. Tax is 20%, reflecting the near-term guidance and a normalized forecasting choice. The forecast excludes new investment gains, acquisitions and FX effects rather than projecting FY2026 unusual gains indefinitely.

## 3. Infrastructure and working capital

Cash capex equals 42%, 37%, 32%, 28%, and 25% of sales, or roughly $168bn–$178bn per year. Infrastructure spending thus remains large even as its share of sales declines. Finance-lease additions are another 4%, 3.5%, 3%, 2.5%, and 2% of sales. Operating lease additions are modeled separately, reflecting management's announced lease classification changes.

Capital purchases in accounts payable are separated from trade payables. PP&E additions equal cash capex plus the change in capital creditors plus noncash finance-lease additions. Operating working capital excludes capital creditors, cash, investments and lease financing. Receivable, inventory and trade payable days are calibrated to FY2026. Other current operating balances generally scale with sales.

Existing depreciable PP&E runs off over an assumed eight remaining years, excluding land. New equipment uses a six-year life, and new buildings 25 years. Two thirds of additions are short-lived equipment. New additions use half-year depreciation. Existing intangible amortization follows Microsoft's disclosed schedule. These are aggregate schedules, not a complete asset register.

## 4. Cash, financing and shares

The cash-flow statement adds noncash charges to net income and reflects changes in operating balances. Investment and financing cash flows determine ending cash, which links into the balance sheet. No debt or equity plug forces the balance sheet to balance.

Corporate maturities are refinanced at a marginal cost of Treasury yield plus an assumed 55bp spread. Legacy bonds use an assumed 3% rate, and finance leases use the disclosed 4.5% weighted-average rate. All forecast interest is expensed, with no capitalized interest. Opening cash and short-term investments earn an assumed 4%, which avoids circular interest calculations.

Dividends are 20% of positive net income, and repurchases are 15%. Stock compensation remains an expense and increases modeled share issuance. A separate assumed transaction-price path determines shares issued and repurchased; it does not set intrinsic value. The initial diluted-share allowance is a 24m-share proxy rather than an award-level treasury-stock calculation.

## 5. DCF

Unlevered free cash flow equals after-tax operating income plus D&A, less cash capex, finance-lease asset additions and investment in operating working capital. Stock compensation is **not** added back in DCF, so it retains an economic cost. Operating rent remains in operating profit; operating lease liabilities are not deducted again in the equity bridge. Finance lease liabilities are deducted as debt.

The valuation date is October 26, 2026. Only the estimated remaining portion of FY2027 cash flow is discounted. Year-end cash-flow discounting is used. The last reported cash, debt and shares are rolled forward with the forecast's elapsed FY2027 fraction; those valuation-date balances are estimates, not new company disclosures.

Cost of equity combines the collected 5% Treasury yield, the 1.053 historical monthly beta and 4.46% published US equity risk premium. Debt includes finance leases, with market-equity weights calculated using the observed share price. This produces **9.55% WACC**. DCF D18 assumes **3% terminal growth**, and D19 assumes **20% terminal ROIC**. Sustainable net reinvestment is terminal NOPAT × growth / ROIC. Terminal growth therefore requires capital investment.

The initial output is **$355.12 per share**, versus the collected **$530.17** quote, an implied **33.0% downside** under these assumptions. Enterprise value is approximately **$2.649trn** and equity value **$2.645trn**. These are model results, not a forecast of the share price.

Approximately **85.2% of enterprise value comes from the terminal period**. The native What-If Data Table tests WACC of roughly 8.55%–10.55% and terminal growth of 2%–4%, producing approximately **$284–$486 per share**. It varies the actual WACC and growth cells driving the model. Keep Excel's calculation mode automatic, including data tables.

## Five-year output (USD billions)

| Metric | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 |
|---|---:|---:|---:|---:|---:|
| Revenue | 399.5 | 475.2 | 555.5 | 636.1 | 711.7 |
| Operating income | 184.1 | 215.5 | 251.2 | 289.7 | 323.3 |
| Net income | 146.0 | 170.4 | 199.3 | 231.9 | 262.0 |
| Unlevered free cash flow | 16.1 | 55.4 | 105.4 | 159.8 | 212.6 |

## How to experiment

First change a revenue growth assumption by one percentage point and follow the effect through Revenue, Statements, Funding and DCF. Then test higher cash capex or a shorter equipment life. Finally vary WACC and terminal growth in the DCF sensitivity table. The model keeps one set of forecasts; sensitivity calculations use that same model.

Review Checks after every change. Accounting differences should be 0.00, cash must remain nonnegative, and WACC must exceed terminal growth. If cash becomes negative, change the capital-return or financing assumptions explicitly. The model does not borrow automatically to conceal a shortfall.

Nonoperating investments are recognized at carrying value by default. Test a haircut in DCF D40 to see how valuation uncertainty changes equity value. Existing asset lives, future lease schedules, private-investment values and diluted shares are material simplifications. Forecasts should be refreshed after FY2027 Q1 results, scheduled for October 28, 2026.

## Sources and reproduction

All source snapshots and provenance remain under `data/`. Microsoft's FY2026 annual report, FY2027 segment recast, earnings transcript and outlook are the principal operating sources. Market sources are identified on Actuals and in the research manifest.

```sh
python model/prepare_inputs.py
node model/build_model.mjs
python model/verify_saved.py
```

The builder uses the bundled `@oai/artifact-tool` library. Its `model/node_modules` junction is environment-specific and ignored by Git. Verification includes accounting reconciliations, sensitivity-center and corner tests, a revenue-driver change and restore, a formula-error scan, and read-only checks of the exported Excel file and native features.
