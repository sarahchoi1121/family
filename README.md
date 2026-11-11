# Family Finance PWA v0.5 — full workbook archive and ledger import

Upload the PUBLIC ZIP contents to GitHub Pages root. **Never upload the PRIVATE JSON or Excel to public GitHub.**

1. Back up existing transactions using Settings → Export JSON.
2. Replace public application files with v0.5.
3. Download PRIVATE v0.5 JSON only to your iPhone.
4. Settings → Full Excel archive → choose private JSON → review counts → import.
5. Export ledger JSON and separately export archived workbook JSON for backups.

All 12 source worksheets are preserved as populated cell values and formulas in IndexedDB. The archive viewer shows the first 300 rows/22 columns; exported archive preserves all. Source Excel formatting, charts and workbook formula evaluation are not reproduced. Five bank movement sheets are mapped to transactions; remaining worksheets are retained as reference data, **not** booked again as income/expense.

**Limitations:** Internal transfers identified by text are tentative and may not be paired; duplicate checks use source IDs and cannot automatically match records imported from earlier v0.3 files. Reconciliation requires actual bank balances. Historical negative movements are provisionally treated as income/refund; validate. No iCloud or cross-phone sync. Data stored locally, not backed up automatically. The v0.5 private file is sensitive.


## v0.6 additions
- Home account balances collapse by default; total includes only accounts with confirmed snapshot balances, including negative credit card amounts. Expand/collapse state is saved locally.
- Compare tab: year-by-year income, expenses and net cash flow, plus per-category comparisons for any two years. Default YTD period uses Jan 1–Nov 1 for fair comparisons to the supplied 2026 archive.
- No private financial data is bundled. Existing local data is preserved by using the same localStorage key.
- Back up ledger JSON and original workbook archive before deployment. This build has not been tested on physical iPhone.

## v0.7 additions
- Compare all imported years side-by-side, with start/end month selectors (default Jan–Oct).
- Same month range applies to annual bars and category comparison; future years update automatically.
- Category names differing only in case/whitespace are combined for comparison display; ledger remains untouched.
- Hide all-zero categories; horizontal scrolling for narrow iPhones.
- Back up ledger and archive before uploading. No private financial data included.

## v0.8
Category comparison now has an independent Expense / Income / Net cash flow selector. All-year table and year bars respect the same month range. Zero-only categories are hidden based on the selected metric. A totals row is included. No private ledger data is bundled.
