Family Finance v1.1.7 PUBLIC — import reliability fix.

Changes: atomic IndexedDB archive + ledger import, IndexedDB-backed ledger for large histories, clear progress/success/error alerts, storage recovery on reload, cache bump.

PRIVATE JSON MUST NOT be uploaded to GitHub. Export a backup before deployment. Do not clear Safari website data.

Note: the app remains device-local; no cross-device sync.


v1.1.8: Fix category mapping render temporal-dead-zone error caused by shadowing the search-result counter with a per-category usage counter. This exception previously interrupted workbook import after IndexedDB commit. Existing ledger and archive are not intentionally cleared.
