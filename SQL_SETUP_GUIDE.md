# SQL Database Setup Guide

This guide walks through setting up an SQL database (MySQL or PostgreSQL) for the crossword app using Amplify Gen2's SQL integration.

## Prerequisites

- AWS Account with Amplify CLI configured
- MySQL 5.7+ or PostgreSQL 12+ database (can be RDS, Aurora, or external)

## Step 1: Provision Database

### Option A: Use Amazon RDS (Recommended)

1. Go to AWS RDS Console
2. Create a new database:
   - Engine: MySQL 8.0 or PostgreSQL 15
   - Template: Free tier (for testing) or Production
   - DB instance identifier: `crossword-db`
   - Master username: `admin`
   - Master password: (save this securely)
   - Public access: Yes (for initial setup)
   - VPC security group: Allow inbound on port 3306 (MySQL) or 5432 (PostgreSQL)

3. Wait for database to be available
4. Note the endpoint hostname

### Option B: Use External Database (Neon, PlanetScale, etc.)

1. Create database on your provider
2. Note the connection details

## Step 2: Create Database Schema

Connect to your database and run the SQL script:

```bash
# For MySQL
mysql -h <hostname> -u <username> -p < scripts/setup-sql-database.sql

# For PostgreSQL
psql -h <hostname> -U <username> -d <database> -f scripts/setup-sql-database.sql
```

This creates three tables:

- `profiles` - User profiles
- `puzzles` - Crossword puzzles
- `user_puzzles` - Join table with completion data

## Step 3: Set Connection String Secret

Create the connection string secret for Amplify:

```bash
# For MySQL
npx ampx sandbox secret set SQL_CONNECTION_STRING
# Enter: mysql://username:password@hostname:3306/database_name

# For PostgreSQL
npx ampx sandbox secret set SQL_CONNECTION_STRING
# Enter: postgres://username:password@hostname:5432/database_name
```

## Step 4: Generate TypeScript Schema

Generate the TypeScript representation of your database:

```bash
npx ampx generate schema-from-database \
  --connection-uri-secret SQL_CONNECTION_STRING \
  --out amplify/data/schema.sql.ts
```

This will:

1. Connect to your database
2. Read the table structures
3. Generate TypeScript types matching your schema
4. Create `amplify/data/schema.sql.ts`

## Step 5: Integrate with Existing Data Model

Update `amplify/data/resource.ts` to combine DynamoDB and SQL schemas:

```typescript
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { schema as ddbSchema } from './resource'; // existing DynamoDB schema
import { schema as generatedSqlSchema } from './schema.sql';

// Add authorization to SQL schema
const sqlSchema = generatedSqlSchema
	.authorization((allow) => allow.authenticated())
	.setRelationships((models) => [
		models.Profile.relationships({
			userPuzzles: a.hasMany('UserPuzzle', 'profile_id')
		}),
		models.Puzzle.relationships({
			userPuzzles: a.hasMany('UserPuzzle', 'puzzle_id')
		}),
		models.UserPuzzle.relationships({
			profile: a.belongsTo('Profile', 'profile_id'),
			puzzle: a.belongsTo('Puzzle', 'puzzle_id')
		})
	]);

// Combine both schemas
const combinedSchema = a.combine([ddbSchema, sqlSchema]);

export type Schema = ClientSchema<typeof combinedSchema>;

export const data = defineData({
	schema: combinedSchema,
	authorizationModes: {
		defaultAuthorizationMode: 'userPool'
	}
});
```

## Step 6: Deploy to Sandbox

Start your sandbox to deploy the SQL integration:

```bash
npx ampx sandbox
```

This will:

1. Create Lambda functions to connect to your SQL database
2. Set up VPC configuration if needed
3. Deploy the combined GraphQL API

## Step 7: Migrate Data

Run the migration script to copy data from DynamoDB to SQL:

```bash
npm run migrate-to-sql
```

Add this script to `package.json`:

```json
{
	"scripts": {
		"migrate-to-sql": "tsx scripts/migrate-ddb-to-sql.ts"
	}
}
```

## Step 8: Test SQL Queries

Test that you can query the SQL data:

```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from './amplify/data/resource';

const client = generateClient<Schema>();

// Query SQL-backed data
const { data: profiles } = await client.models.Profile.list();
console.log('SQL Profiles:', profiles);
```

## Step 9: Production Deployment

For production:

1. Set the secret in Amplify Console:
   - Go to Amplify Console → Your App → Environment variables
   - Add secret: `SQL_CONNECTION_STRING`
   - Value: Your production database connection string

2. Deploy your branch:
   ```bash
   git push origin main
   ```

## Troubleshooting

### Connection Issues

If you can't connect to the database:

1. Check security group allows inbound traffic on database port
2. Verify database is publicly accessible (for initial setup)
3. Confirm connection string format is correct
4. Test connection manually:
   ```bash
   mysql -h <hostname> -u <username> -p
   # or
   psql -h <hostname> -U <username> -d <database>
   ```

### VPC Configuration

If your database is in a VPC:

1. Database must be marked as "Publicly accessible"
2. Add inbound rule for your IP address
3. Amplify will automatically detect VPC and configure Lambda

### Schema Generation Fails

If `generate schema-from-database` fails:

1. Ensure all tables have primary keys
2. Check database user has SELECT permissions
3. Verify connection string is correct
4. Try with `--debug` flag for more info

## Next Steps

After setup is complete:

1. Review `MIGRATION_TO_SQL.md` for the full migration plan
2. Update queries to use SQL where beneficial (see `src/routes/helpers/sql/`)
3. Monitor performance improvements
4. Gradually phase out DynamoDB queries
