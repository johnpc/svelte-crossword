// Historical one-off (DynamoDB -> SQL profile migration, already executed).
// The RDS instance is now private (no public IP), so SQL goes through the
// IAM-gated admin-sql Lambda instead of a direct connection. Needs admin AWS
// credentials (AWS_PROFILE=personal) — no SQL_CONNECTION_STRING required.
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import config from '../src/amplify_outputs.json';
import { execute } from './admin-sql-client';
import dotenv from 'dotenv';
dotenv.config();

Amplify.configure(config);
const client = generateClient<Schema>({ authMode: 'iam' });

async function migrateProfiles() {
	console.log('Migrating profiles...');
	let nextToken: string | null | undefined;
	let count = 0;

	do {
		const response = await client.models.Profile.list({ limit: 100, nextToken });

		for (const profile of response.data) {
			try {
				await execute(
					'INSERT INTO profiles (id, user_id, name, email, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE id=id',
					[profile.id, profile.userId, profile.name, profile.email]
				);
				count++;
				if (count % 100 === 0) console.log(`  ✓ Migrated ${count} profiles...`);
			} catch (error) {
				console.error(
					`  ✗ Failed: ${profile.email}`,
					error instanceof Error ? error.message : String(error)
				);
			}
		}

		nextToken = response.nextToken;
	} while (nextToken);

	console.log(`✓ Migrated ${count} profiles\n`);
	return count;
}

const main = async () => {
	await migrateProfiles();
};

main();
