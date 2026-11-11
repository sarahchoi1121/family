# Family Finance PWA v0.5 — full workbook archive and ledger import

Upload the PUBLIC ZIP contents to GitHub Pages root. **Never upload the PRIVATE JSON or Excel to public GitHub.**

1. Back up existing transactions using Settings → Export JSON.
2. Replace public application files with v0.5.
3. Download PRIVATE v0.5 JSON only to your iPhone.
4. Settings → Full Excel archive → choose private JSON → review counts → import.
5. Export ledger JSON and separately export archived workbook JSON for backups.

All 12 source worksheets are preserved as populated cell values and formulas in IndexedDB. The archive viewer shows the first 300 rows/22 columns; exported archive preserves all. Source Excel formatting, charts and workbook formula evaluation are not reproduced. Five bank movement sheets are mapped to transactions; remaining worksheets are retained as reference data, **not** booked again as income/expense.

**Limitations:** Internal transfers identified by text are tentative and may not be paired; duplicate checks use source IDs and cannot automatically match records imported from earlier v0.3 files. Reconciliation requires actual bank balances. Historical negative movements are provisionally treated as income/refund; validate. No iCloud or cross-phone sync. Data stored locally, not backed up automatically. The v0.5 private file is sensitive.
