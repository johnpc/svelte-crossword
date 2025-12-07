import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import config from '../src/amplify_outputs.json';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

Amplify.configure(config);
const client = generateClient<Schema>({ authMode: 'iam' });

const getConnection = async () => {
	const url = new URL(process.env.SQL_CONNECTION_STRING!);
	return mysql.createConnection({
		host: url.hostname,
		port: parseInt(url.port || '3306'),
		user: url.username,
		password: url.password,
		database: url.pathname.slice(1)
	});
};

async function migrateProfiles(conn: any) {
	console.log('Migrating profiles...');
	let nextToken: string | null | undefined;
	let count = 0;

	do {
		const response = await client.models.Profile.list({ limit: 100, nextToken });

		for (const profile of response.data) {
			try {
				await conn.execute(
					'INSERT INTO profiles (id, user_id, name, email, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE id=id',
					[profile.id, profile.userId, profile.name, profile.email]
				);
				count++;
				if (count % 100 === 0) console.log(`  ✓ Migrated ${count} profiles...`);
			} catch (error) {
				console.error(`  ✗ Failed: ${profile.email}`, error instanceof Error ? error.message : String(error));
			}
		}

		nextToken = response.nextToken;
	} while (nextToken);

	console.log(`✓ Migrated ${count} profiles\n`);
	return count;
}

const main = async () => {
	const conn = await getConnection();
	
	try {
		await migrateProfiles(conn);
	} finally {
		await conn.end();
	}
};

main();
