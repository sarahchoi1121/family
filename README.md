# Family Finance v1.1.0 (PUBLIC code only)

Based on v1.0.9. Adds collapsible Bank reconciliation under Settings → Bank balances & reconciliation.

1. First export a JSON backup from the existing app.
2. Upload ONLY the public application files to GitHub Pages. Never upload transaction or private history JSON.
3. For each bank account, enter a confirmed opening balance and date in the existing Bank balances section.
4. Expand Bank reconciliation, select account and statement date, enter actual bank balance and compare. Save a reconciliation record if desired.

Reconciliation uses original currency and transactions strictly after the opening date up to and including the statement date. Different currencies are never added. It does not silently change confirmed opening balances or transactions. Past reconciliation records are stored locally in app data. Same-day transactions on the opening date are considered included in the opening balance. Historical Excel data may be incomplete: check missing transactions and currencies before trusting calculated figures.

No private account names, personal category names or financial records are bundled.
