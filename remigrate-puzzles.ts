import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from './amplify/data/resource';
import config from './src/amplify_outputs.json';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

Amplify.configure(config);
const client = generateClient<Schema>({ authMode: 'iam' });

async function main() {
	const url = new URL(process.env.SQL_CONNECTION_STRING!);
	const conn = await mysql.createConnection({
		host: url.hostname,
		port: parseInt(url.port || '3306'),
		user: url.username,
		password: url.password,
		database: url.pathname.slice(1)
	});

	await conn.execute('DELETE FROM puzzles');
	console.log('✓ Cleared puzzles table\n');

	console.log('Migrating puzzles...');
	let nextToken: string | null | undefined;
	let count = 0;

	do {
		const response = await client.models.Puzzle.list({ limit: 100, nextToken });

		for (const puzzle of response.data) {
			try {
				await conn.execute(
					'INSERT INTO puzzles (id, puz_json, puz_key, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
					[puzzle.id, JSON.stringify(puzzle.puzJson), puzzle.puzKey]
				);
				count++;
				if (count % 100 === 0) console.log(`  ✓ Migrated ${count} puzzles...`);
			} catch (error) {
				console.error(`  ✗ Failed: ${puzzle.id}`, error);
			}
		}

		nextToken = response.nextToken;
	} while (nextToken);

	console.log(`✓ Migrated ${count} puzzles`);
	await conn.end();
}

main();
