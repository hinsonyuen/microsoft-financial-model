# Building your first Microsoft financial model

## Choose a clear modeling scope

Start with an annual forecast for FY2027–FY2031, based on FY2022–FY2026 actuals, and value the business using unlevered free cash flow. Five years of history help distinguish durable trends from acquisition effects, changing segment definitions and unusual gains. Quarterly data is available for recent segments as a cross-check; a full quarterly forecast is optional.

At the October 26, 2026 cutoff, FY2027 Q1 results have not been released. The announced release date is October 28. Incorporate that release before making a later valuation. Source: https://news.microsoft.com/source/2026/10/07/microsoft-announces-quarterly-earnings-release-date-69/

## Build in this order

1. **Historical statements.** Lay out actuals by year. Link every number to a source and use a single unit convention: USD millions, shares in millions, EPS in USD/share. Preserve reported cash flow signs.
2. **Revenue and operating costs.** Forecast each segment's sales growth, gross margin and operating expenses. Add segment sales and operating income to consolidated totals. `historical_drivers.csv` provides calculated consolidated growth, margin, effective tax and cash-capex ratios as anchors.
3. **Working capital.** Forecast receivables using revenue and collection days; inventory using cost of sales and holding days; payables using appropriate purchases or cost assumptions; and deferred revenue/accruals with business-specific drivers. Exclude cash and financing debt from operating working capital. Balance-sheet changes are not always the same as cash-flow movements because of acquisitions, FX and noncash changes.
4. **Fixed assets and leases.** Begin with opening PP&E, add cash and noncash asset additions, subtract depreciation and disposals, and reconcile closing PP&E. Keep cash capex, finance-lease additions, lease principal payments and depreciation separate. Read the asset useful-life disclosures and management commentary before applying historical depreciation ratios.
5. **Debt, interest, taxes and equity.** Use maturity schedules, explicit borrowing/repayment decisions, a reasonable cash yield and borrowing cost, normalized tax, stock compensation, dilution, dividends and buybacks. Do not forecast volatile investment gains as recurring operating earnings. Dividends and buybacks are financing uses, not operating expenses.
6. **Link all three statements.** Net income flows into retained earnings and cash flow; ending cash flows back to the balance sheet. Include share issuance and stock compensation correctly. Use an explicit cash/debt funding policy if cash goes negative, and avoid an uncontrolled interest/debt circular reference.
7. **DCF and sensitivities.** Calculate operating free cash flow, discount it, add a terminal value, bridge to equity and divide by an appropriate diluted share count. Test a range of growth, infrastructure investment, margins, WACC and terminal growth.

## Microsoft-specific issues

**Use the FY2027 reporting basis for the revenue build.** Microsoft's September 2 presentation recasts FY2025 and FY2026 into Agents and Infra and Devices and Consumer. The older Productivity and Business Processes / Intelligent Cloud / More Personal Computing structure remains in the annual reports. Product and metric definitions also change. The original SEC presentation and readable text preserve those changes; `recast_segments.csv` extracts the new segment history. There is no invented five-year history for the new segments.

**Read the updated outlook.** The September presentation contains a mechanically adjusted FY2027 Q1 outlook under the new segment structure. It supersedes the segment grouping in the original July outlook slides; retain both as evidence of the change. Numeric guidance, operating metrics and the source's currency conventions are in `fy27_segment_recast_text.txt`, `fy26q4_transcript_text.txt` and the original documents. The original outlook PowerPoint is image-based and has no extractable slide text; view that source directly. Management guidance is not an assurance of future results.

**Cloud revenue overlaps the segments.** Microsoft Cloud is a cross-business metric, not an extra segment to add to total revenue. Azure and cloud metric definitions change in the FY2027 presentation. Avoid combining reported growth and constant-currency growth as if they were the same measure. Commercial remaining performance obligations represent contracted future revenue over varying time horizons; they are not all next year's revenue or cash.

**Infrastructure investment has several measures.** Cash additions to PP&E, spending including finance leases, asset additions and depreciation are different concepts. Retain the cash/noncash distinction and make the DCF and lease-liability treatment consistent. The cash-flow row 'Depreciation, amortization, and other' is not automatically pure depreciation and amortization for a DCF; consult the supporting notes.

**Separate operating earnings from investments.** Review OpenAI and other investment gains/losses, tax effects and other unusual items. The Q4 release supplies GAAP/non-GAAP reconciliations. Do not mechanically treat every non-GAAP adjustment as economically irrelevant. Avoid counting the same investment value in both forecast cash flows and the enterprise-to-equity bridge.

**Handle stock compensation explicitly.** It affects both expenses and dilution. If it is added back as a noncash cost, account for the economic dilution or offsetting repurchases consistently. Weighted-average diluted shares from the income statement are not identical to current shares outstanding or a fully diluted valuation share count; review the latest cover-page/SEC disclosures and outstanding awards.

## Valuation inputs and formulas

For a USD DCF, keep cash flows and discount rates in nominal USD:

```text
NOPAT = operating profit × (1 − normalized operating tax rate)
Unlevered FCF = NOPAT + D&A − capital expenditure − change in operating working capital
Cost of equity = risk-free rate + beta × equity risk premium
After-tax cost of debt = marginal pretax borrowing cost × (1 − marginal tax rate)
WACC = E/(D+E) × cost of equity + D/(D+E) × after-tax cost of debt
Terminal value = FCF in year 6 / (WACC − terminal growth)
Enterprise value = present value of forecast FCF + present value of terminal value
Equity value = enterprise value + excess cash + nonoperating investments − debt − other claims
Value per share = equity value / appropriate diluted shares outstanding
```

WACC weights should use market values. Decide whether lease financing is treated as debt and adjust operating cash flow and the equity bridge consistently. Use a sustainable terminal reinvestment rate: terminal growth cannot be free of investment. WACC must exceed terminal growth. A valuation on October 26 requires an explicit stub-period/midyear convention; discounting five full fiscal years from June 30 without an adjustment would mismatch the valuation date. Do not count already elapsed cash flows as future cash flows.

`valuation_inputs.json` holds the quote, risk-free observation and published US equity risk premium. `calculated_beta.json` records the beta method and window. The original debt note provides coupons, effective rates and maturities; a current marginal borrowing spread must be selected as a modeling assumption, rather than presenting an old coupon as today's funding cost.

## Decisions still needed to produce a valuation

These are judgments, not missing historical reports. Keep a base, downside and upside assumption set:

| Driver | How to choose it |
|---|---|
| Segment growth and eventual slowdown | Recast history, management outlook, addressable demand and competitive constraints |
| Gross margin and operating expense growth | Mix, AI infrastructure cost, utilization and hiring efficiency |
| Capex, leases and asset lives | Capacity needs, management guidance and PP&E/lease notes |
| Receivable/payable days and deferred revenue | Historical ratios adjusted for business mix |
| Normalized tax and investment income | Separate operating tax, financing income and unusual gains |
| Debt, liquidity, buybacks and dividends | Maturities, liquidity needs and capital-return policy |
| ERP, beta, borrowing spread and capital structure | Document chosen vintage, methodology and sensitivity |
| Terminal growth, margins and reinvestment | Long-run economic plausibility and growth/return consistency |

No forecast assumption or company value has been fabricated in the data package. Comparable-company valuation is an optional second approach; this package is scoped to the three statements and DCF, so it does not claim to include a peer trading-multiples dataset.

## Verification before relying on the model

Require balance-sheet balance, cash rollforward, retained earnings/equity rollforward, segment totals, PP&E/lease and debt rollforwards, and a consistent share count. Review terminal value as a proportion of enterprise value, and test the impact of lower growth or heavier infrastructure spending. The supplied data checks establish 47 historical arithmetic reconciliations; forecast checks must be added when the model is built.
