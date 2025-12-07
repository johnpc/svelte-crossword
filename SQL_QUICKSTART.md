# SQL Migration Quick Start

## Setup Commands

```bash
# 1. Set database connection secret
npx ampx sandbox secret set SQL_CONNECTION_STRING
# Enter: mysql://user:pass@host:3306/dbname

# 2. Create database tables
mysql -h <host> -u <user> -p < scripts/setup-sql-database.sql

# 3. Generate TypeScript schema from database
npx ampx generate schema-from-database \
  --connection-uri-secret SQL_CONNECTION_STRING \
  --out amplify/data/schema.sql.ts

# 4. Start sandbox with SQL integration
npx ampx sandbox

# 5. Migrate data from DynamoDB to SQL
npm run migrate-to-sql
```

## Key Files

- `scripts/setup-sql-database.sql` - SQL table definitions
- `scripts/migrate-ddb-to-sql.ts` - Data migration script
- `amplify/data/schema.sql.ts` - Generated TypeScript schema (auto-generated)
- `src/routes/helpers/sql/` - Optimized SQL query helpers
- `SQL_SETUP_GUIDE.md` - Detailed setup instructions
- `MIGRATION_TO_SQL.md` - Full migration strategy

## Performance Gains

| Query        | Before (DynamoDB) | After (SQL)          |
| ------------ | ----------------- | -------------------- |
| Leaderboard  | 101 queries       | 1 query              |
| User history | Full table scan   | Indexed lookup       |
| Streak calc  | Client-side       | Database aggregation |

## Example: Leaderboard Query

**Before (DynamoDB - N+1 queries):**

```typescript
const profiles = await client.models.Profile.list(); // 1 query
for (const profile of profiles) {
	const puzzles = await getAllUserPuzzles(profile); // N queries
	profile.count = puzzles.length;
}
```

**After (SQL - 1 query):**

```typescript
const leaderboard = await client.queries.custom({
	query: `
    SELECT p.id, p.name, COUNT(up.id) as count
    FROM profiles p
    LEFT JOIN user_puzzles up ON p.id = up.profile_id
    GROUP BY p.id
    ORDER BY count DESC
  `
});
```
