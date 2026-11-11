Family Finance v1.2.1 PUBLIC CODE ONLY. No private transaction records or category profile included.
Fixes: backup restore and category profile import persist to IndexedDB; Compare income uses transaction type; cache bumped.
To match your Excel category groups, import the separate PRIVATE category profile locally via Settings > Custom category profiles.
Original Excel vs imported transactions may still differ: classification alone does not correct missing, extra or differing transactions.
Export backup before deploying or changing category settings.

Version 1.2.2: clean empty category template for new users; optional Clear category template control removes locally saved profile names without deleting transactions. Existing local data is never silently reset.

## v1.2.3
Private full-history JSON import reads Comparison category groups, previews new/changed/unchanged transaction IDs, and optionally updates changed records. Export a backup first. No private data is bundled.


v1.2.4: Added a two-confirmation Clear imported Excel archive button. It deletes only the IndexedDB archive/workbook record; ledger, transactions, category mappings, and accounts remain unchanged.
