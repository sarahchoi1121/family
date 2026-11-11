# Family Finance v1.0.8 — Account matching fix (public code only)

Account matching is case-insensitive and whitespace-insensitive throughout History filters, account selectors, reconciliation, and same-currency transfers. Source transactions and their original account names are not rewritten.

Aliases with conflicting explicit currencies or different confirmed balance snapshots are kept separate and flagged for review. Matching aliases with one confirmed balance share one reconciliation panel. No conversion or data deletion is performed.

**Before updating:** export JSON and Excel Archive backups on the existing iPhone. Upload only public app files to GitHub. Never upload financial backups, Excel, or private JSON. Test with actual data before relying on balance calculations.
