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


## v0.9 reporting update
Income classification is restricted to Cash Rebate, Avery, Valerie, Interest, Sarah Salary and Zac Salary. All other Excel categories are expense categories and may be mapped to recurring, non-recurring or fixed assets in Settings. Year and category comparison offer those group filters. Mappings are kept in local JSON backup; original imported transactions are unchanged. Review inferred groupings and source credits before treating totals as audited. This does not add cloud sync.


## v1.0 custom category profiles
- Migrates v0.9 six income categories and existing expense mappings to editable per-device category profile.
- Add, rename, change Income/Recurring/Non-recurring/Fixed type, deactivate, export/import category profile JSON.
- Historical source transaction category strings are not rewritten; renamed categories use aliases for report classification.
- Profile and mapping live inside the existing private ledger backup (localStorage); never upload private backup to public GitHub.
- Imported Excel categories not in profile are added as expense suggestions. Review classification manually.
- This version has not been tested on a physical iPhone; export ledger and archive backups before updating. No two-device sync.


v1.2.30: Conservative Apple Shortcuts Live Text Tesco parser. Split-column OCR preserves product names and negative discounts but intentionally leaves prices, dates, and totals unverified when unreliable. Verify every line manually before saving. No cloud OCR or API.

## v1.2.32
- Tesco Apple Live Text detached-price matching only when the number of positive standalone prices exactly matches the number of products missing prices. Otherwise prices remain unverified (zero) and saving is blocked.
- Discounts stay separate negative entries; receipt total must be entered and reconcile before save.
- No personal finance data is bundled. Category selections use the locally imported Comparison category profile.
