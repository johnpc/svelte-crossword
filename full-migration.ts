import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from './amplify/data/resource';
import config from './src/amplify_outputs.json';
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
				console.error(`  ✗ Failed: ${profile.email}`);
			}
		}

		nextToken = response.nextToken;
	} while (nextToken);

	console.log(`✓ Migrated ${count} profiles\n`);
	return count;
}

async function migratePuzzles(conn: any) {
	console.log('Migrating puzzles...');
	let nextToken: string | null | undefined;
	let count = 0;

	do {
		const response = await client.models.Puzzle.list({ limit: 100, nextToken });

		for (const puzzle of response.data) {
			try {
				await conn.execute(
					'INSERT INTO puzzles (id, puz_json, puz_key, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE id=id',
					[puzzle.id, JSON.stringify(puzzle.puzJson), puzzle.puzKey]
				);
				count++;
				if (count % 100 === 0) console.log(`  ✓ Migrated ${count} puzzles...`);
			} catch (error) {
				console.error(`  ✗ Failed: ${puzzle.id}`);
			}
		}

		nextToken = response.nextToken;
	} while (nextToken);

	console.log(`✓ Migrated ${count} puzzles\n`);
	return count;
}

async function migrateUserPuzzles(conn: any) {
	console.log('Migrating user puzzles...');
	let nextToken: string | null | undefined;
	let count = 0;

	do {
		const response = await client.models.UserPuzzle.list({ limit: 100, nextToken });

		for (const up of response.data) {
			try {
				await conn.execute(
					'INSERT INTO user_puzzles (id, profile_id, puzzle_id, used_check, used_reveal, used_clear, time_in_seconds, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE id=id',
					[up.id, up.profileCompletedPuzzlesId, up.userPuzzlePuzzleId, up.usedCheck ? 1 : 0, up.usedReveal ? 1 : 0, up.usedClear ? 1 : 0, up.timeInSeconds]
				);
				count++;
				if (count % 100 === 0) console.log(`  ✓ Migrated ${count} user puzzles...`);
			} catch (error) {
				console.error(`  ✗ Failed: ${up.id}`);
			}
		}

		nextToken = response.nextToken;
	} while (nextToken);

	console.log(`✓ Migrated ${count} user puzzles\n`);
	return count;
}

const main = async () => {
	console.log('Starting full migration...\n');
	const conn = await getConnection();
	
	try {
		const profileCount = await migrateProfiles(conn);
		const puzzleCount = await migratePuzzles(conn);
		const userPuzzleCount = await migrateUserPuzzles(conn);
		
		console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('Migration complete!');
		console.log(`Total: ${profileCount} profiles, ${puzzleCount} puzzles, ${userPuzzleCount} user puzzles`);
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	} finally {
		await conn.end();
	}
};

main();
