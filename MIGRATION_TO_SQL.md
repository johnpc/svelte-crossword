# Migration from DynamoDB to Amplify SQL

## Current State: DynamoDB Data Model

### Tables

- **Profile**: User profiles with basic info
- **Puzzle**: Crossword puzzles with JSON data
- **UserPuzzle**: Join table linking profiles to completed puzzles

### Current Relationships

```
Profile (1) ----< UserPuzzle >---- (1) Puzzle
```

### Current Query Patterns & Inefficiencies

#### 1. Leaderboard Query (N+1 Problem)

**Location**: `src/routes/leaderboard/+page.svelte`

**Current approach**:

1. Fetch ALL profiles (1 query)
2. For EACH profile, fetch all their UserPuzzles (N queries)
3. Count puzzles in application code
4. Sort in application code

**Problem**: Makes N+1 queries where N = number of users. With 100 users, this is 101 queries.

#### 2. User History Query (Multiple Scans)

**Location**: `src/routes/history/+page.svelte`

**Current approach**:

1. Fetch user profile
2. Scan UserPuzzle table with filter on profileId (paginated)
3. Manually deduplicate puzzles in application code
4. Sort by date in application code

**Problem**: Full table scan with client-side filtering, deduplication, and sorting.

#### 3. Puzzle Listing (Full Table Scan)

**Location**: `src/routes/helpers/getAllPuzzles.ts`

**Current approach**:

1. Scan entire Puzzle table (paginated, up to 1000 items per page)
2. Parse JSON for each puzzle to extract clues
3. Sort in application code

**Problem**: Fetches all puzzles every time, parses large JSON blobs repeatedly.

#### 4. Streak Calculation (Client-Side Aggregation)

**Location**: `src/routes/helpers/getStreakInfo.ts`

**Current approach**:

1. Fetch all UserPuzzles for a profile
2. Group by date in application code
3. Calculate streaks with complex date logic in JavaScript

**Problem**: All aggregation logic runs client-side after fetching all data.

## Target State: Amplify SQL

### Why SQL?

- **Efficient joins**: Single query for leaderboard instead of N+1
- **Aggregations**: COUNT, GROUP BY, ORDER BY at database level
- **Filtering**: WHERE clauses instead of client-side filtering
- **Indexes**: Fast lookups on foreign keys and dates
- **Reduced data transfer**: Only fetch what you need

### SQL Schema

```sql
CREATE TABLE profiles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE puzzles (
  id VARCHAR(255) PRIMARY KEY,
  puz_json TEXT NOT NULL,
  puz_key VARCHAR(255),
  title VARCHAR(255),
  author VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
);

CREATE TABLE user_puzzles (
  id VARCHAR(255) PRIMARY KEY,
  profile_id VARCHAR(255) NOT NULL,
  puzzle_id VARCHAR(255) NOT NULL,
  used_check BOOLEAN NOT NULL DEFAULT FALSE,
  used_reveal BOOLEAN NOT NULL DEFAULT FALSE,
  used_clear BOOLEAN NOT NULL DEFAULT FALSE,
  time_in_seconds INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_profile_puzzle (profile_id, puzzle_id),
  INDEX idx_profile_created (profile_id, created_at),
  INDEX idx_created_at (created_at)
);
```

### Optimized Query Examples

#### Leaderboard (1 query instead of N+1)

```sql
SELECT
  p.id,
  p.name,
  p.email,
  COUNT(up.id) as completed_count
FROM profiles p
LEFT JOIN user_puzzles up ON p.id = up.profile_id
GROUP BY p.id, p.name, p.email
ORDER BY completed_count DESC
LIMIT 100;
```

#### User History with Stats (1 query)

```sql
SELECT
  up.*,
  pz.title,
  pz.author
FROM user_puzzles up
JOIN puzzles pz ON up.puzzle_id = pz.id
WHERE up.profile_id = ?
ORDER BY up.created_at DESC;
```

#### Streak Calculation (database-level)

```sql
SELECT
  DATE(created_at) as puzzle_date,
  COUNT(*) as puzzles_completed
FROM user_puzzles
WHERE profile_id = ?
GROUP BY DATE(created_at)
ORDER BY puzzle_date DESC;
```

## Migration Plan

### Phase 1: Provision SQL Database

1. Create RDS MySQL/PostgreSQL instance (or use external provider)
2. Run `scripts/setup-sql-database.sql` to create tables
3. Set `SQL_CONNECTION_STRING` secret
4. Generate schema: `npx ampx generate schema-from-database`

### Phase 2: Integrate SQL with Amplify

1. Combine DynamoDB and SQL schemas in `amplify/data/resource.ts`
2. Deploy to sandbox: `npx ampx sandbox`
3. Verify Lambda functions created for SQL access

### Phase 3: Data Migration Script

Create `scripts/migrate-ddb-to-sql.ts`:

1. Read all data from DynamoDB tables
2. Transform to SQL format
3. Batch insert into SQL tables
4. Verify row counts match

### Phase 3: Dual-Write Period

1. Update mutations to write to both DynamoDB and SQL
2. Monitor for consistency
3. Run in production for 1-2 weeks

### Phase 4: Read Cutover

1. Update queries to read from SQL
2. Keep DynamoDB writes as backup
3. Monitor performance improvements

### Phase 5: Cleanup

1. Remove DynamoDB writes
2. Archive DynamoDB tables
3. Remove old data model code

## Expected Performance Improvements

| Operation               | Current            | With SQL             | Improvement        |
| ----------------------- | ------------------ | -------------------- | ------------------ |
| Leaderboard (100 users) | 101 queries        | 1 query              | 100x fewer queries |
| User history            | Full scan + filter | Indexed lookup       | 10-50x faster      |
| Streak calculation      | Client-side        | Database aggregation | 5-10x faster       |
| Data transfer           | ~500KB             | ~50KB                | 10x less data      |

## Implementation Files

- `amplify/data/sql-resource.ts` - SQL schema definition
- `scripts/migrate-ddb-to-sql.ts` - Migration script
- `src/routes/helpers/sql/` - New SQL query helpers
- `MIGRATION_CHECKLIST.md` - Step-by-step execution plan
