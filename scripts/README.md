# Scripts

Utility and maintenance scripts. Most are one-off operational tools; the only
one wired into automation is `crap-check.js`.

- **crap-check.js** — CRAP-score gate. Reads `coverage/coverage-final.json`
  (run `npm run test:coverage` first) and fails if any `.ts`/`.js` function
  exceeds the complexity-vs-coverage threshold. Runs in CI after the coverage
  step. See `npm run test:crap`.
- **delete-user-account.ts** — GDPR/privacy account deletion. See the
  "Deleting User Accounts" section of the top-level README.
- **admin-sql-client.ts** — runs parameterized SQL through the IAM-gated
  `admin-sql` Lambda against the SQLite database on EFS (`/mnt/db/crossword.sqlite`).
  Nightly snapshots land in the storage bucket under `internal/backups/<date>.sqlite`.
- **lookup-stats.ts** — ad-hoc stats lookup against the SQL database.
- **migrate-ddb-to-sql.ts / direct-rds-migration.ts / test-migration.ts /
  complete-sql-setup.sh** — one-off DynamoDB→RDS-era migration tooling, kept
  for reference (RDS itself was replaced by SQLite on EFS).
