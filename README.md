# Family Finance PWA 0.2

## Included
- Responsive installable iPhone PWA
- Local income and expense tracking in GBP
- Payment accounts and payer
- Itemised receipt OCR via Tesseract.js CDN (internet required)
- Editable item categories and memorised categorisation rules
- Monthly dashboard and transaction search
- JSON backup/restore and CSV export
- Offline shell via service worker (after first online visit)

## Deployment without a computer
1. Create a free GitHub account and a NEW PUBLIC repository named `family-finance-pwa` (source code only; NEVER upload receipt images, bank statements, API keys or backups).
2. In Safari, open the repository, use Add file > Upload files, and upload the files from this ZIP (unzipped via iPhone Files).
3. Open repository Settings > Pages > Build and deployment > Deploy from a branch > main / (root), Save.
4. Wait for GitHub Pages to publish at https://YOURUSERNAME.github.io/family-finance-pwa/ .
5. Open that HTTPS address in iPhone Safari > Share > Add to Home Screen > Add.

## Important limitations
- **No cloud sync or multi-user login in 0.2.** Each device has its own isolated local data. Sharing a URL does not share the ledger.
- The source code can be public, but transactions are saved only in browser localStorage. Do not enter sensitive bank account numbers.
- OCR relies on an external CDN for its JavaScript engine. The selected image is processed in the browser by Tesseract.js, not intentionally uploaded to a backend. The CDN is a third party and requires internet to load.
- OCR receipt item parsing is heuristic and will miss or misread lines, discounts and quantities. Review carefully.
- Receipt images are NOT retained in this build.
- Discounts need to be allocated manually to relevant item prices. Negative discount lines are blocked on save.
- LocalStorage can be erased by clearing website data or browser eviction. Export regular JSON backups.
- iCloud sharing requires a future backend with authenticated user access, per-household permissions, and server-side row-level security. Do not place private Supabase service-role keys in browser code.
