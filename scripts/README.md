# Scripts

Utility and maintenance scripts. Most are one-off operational tools; the only
one wired into automation is `crap-check.js`.

- **crap-check.js** — CRAP-score gate. Reads `coverage/coverage-final.json`
  (run `npm run test:coverage` first) and fails if any `.ts`/`.js` function
  exceeds the complexity-vs-coverage threshold. Runs in CI after the coverage
  step. See `npm run test:crap`.
- **delete-user-account.ts** — GDPR/privacy account deletion. See the
  "Deleting User Accounts" section of the top-level README.
- **lookup-stats.ts** — ad-hoc stats lookup against the SQL database.
- **migrate-ddb-to-sql.ts / direct-rds-migration.ts / test-migration.ts /
  setup-sql-database.sql / complete-sql-setup.sh** — one-off DynamoDB→RDS/SQL
  migration tooling, kept for reference.
