# Family Finance v1.2.13 — Recovery build

Upload all 20 files to the **root** of the public GitHub Pages repository. This ZIP contains application code ONLY, no private finance records.

Changes: unique Service Worker cache key; consistent JS version query; standalone recovery.html to export the existing IndexedDB ledger without loading report scripts; no immediate heavy render after import; history initially capped at 150 displayed rows (search still scans all). Avoids rewriting the entire ledger into localStorage on IndexedDB restore.

IMPORTANT: Do NOT delete the installed PWA or clear site data. Before any further import, open recovery.html **inside the original PWA** and export a private backup. Safari may have separate storage. A public GitHub Pages deployment cannot guarantee that a broken installed PWA will fetch the update; if the old service worker remains stuck, additional device-level troubleshooting may be necessary.
