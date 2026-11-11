# Family Finance v1.0.1 — Import & Backup settings cleanup

This public PWA update groups the existing full Excel archive import, transactions-only import, and backup controls into one Settings → Import & Backup area. The transactions-only importer is collapsed by default. No import IDs, transaction data formats, or storage keys were changed. This update does not add automatic deduplication across different import file formats.

Before updating, export your private ledger JSON and archived workbook JSON separately. Never upload private financial data to public GitHub. Upload the extracted public files to the repository root and allow GitHub Pages to deploy. Existing data is device-local; do not clear Safari website data.


v1.0.2: Compare has a collapsed Income & expenses summary for Income, Recurring, Non-recurring and Fixed assets by year, respecting month filters. Net cash flow removed from both comparison dropdowns. No changes to stored transaction data.
