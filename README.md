# Family Finance v1.0.3 — Privacy cleanup

This public release removes all household-specific income category seeds from the application source. Category profiles are now derived only from existing on-device transactions, mappings and user-created categories. New installations do not include personal income categories. Existing saved profiles and transaction data are intentionally not erased by the update.

IMPORTANT: Previously published source code may remain in Git history and third-party caches even after replacing files. If the repository was public, review its commit history and consider restricting access or rewriting history. Never upload private transaction files or profile exports to GitHub.

Before updating, export a JSON backup from the existing app. Do not clear Safari website data.
