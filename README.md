# Family Finance PWA v0.4 — Bank balances

Upload all public files to the **root** of your existing GitHub Pages repository. Do NOT upload any personal Excel, JSON history or backups.

## Added
- Account balances on Home, and confirmed-balance/date entry under Settings
- Balance calculated from confirmed statement amount plus income/expenses **after** the confirmation date
- Transfer between accounts, excluded from income and expense totals
- Existing v0.3 localStorage data retained (same key)

## Important limitations
- No automatic bank connection or iCloud/household sync
- Historical Excel bank movements alone do not prove current balances
- Imported historical transfers are not reconstructed into two-sided transfers; reconcile each bank account using a recent bank statement
- Transactions recorded on the same day as a snapshot are excluded to avoid double counting: use end-of-day statement balance
- All data stays in local browser storage; export a JSON backup before updating
- Deleting transfers removes the movement from both accounts; existing v0.3 history import remains unchanged
