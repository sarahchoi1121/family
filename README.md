Family Finance v1.2.15 public app recovery.
Fix: missing fullSyncChanged and fullKeepArchive controls caused preview to fail and prevented import. Includes a visible manual Validate button.
Upload ONLY app files to GitHub, never private financial JSON.
Use original PRIVATE Comparison monthly JSON locally on iPhone.
No existing on-device data is deleted by deploying these files.


### v1.2.17 signed Comparison correction
- Uses signed monthly Comparison values, not absolute expenses.
- Historical Net matches Excel accounting convention: signed expenses + signed income.
- FY2025 includes a clearly labelled -GBP300,000 annual reconciliation adjustment from the source workbook, not present in monthly category rows.
- Normal transactions from November 2026 onward retain normal app convention.
- To replace previously imported incorrect history: export a PRIVATE backup first, then check "Replace all existing transactions before 1 Nov 2026" while importing the corrected PRIVATE JSON.
- Never upload PRIVATE JSON to public GitHub.
