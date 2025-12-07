import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import config from '../src/amplify_outputs.json';

Amplify.configure(config);

const client = generateClient<Schema>({ authMode: 'iam' });

async function migrateProfiles() {
	console.log('Migrating profiles from DynamoDB to SQL...');
	let nextToken: string | null | undefined;
	let count = 0;

	do {
		const response = await client.models.Profile.list({ limit: 100, nextToken });

		for (const profile of response.data) {
			try {
				await client.models.SqlProfile.create({
					id: profile.id,
					user_id: profile.userId,
					name: profile.name,
					email: profile.email
				});
				count++;
				console.log(`  ✓ Migrated profile: ${profile.email}`);
			} catch (error) {
				if (error instanceof Error && error.message?.includes('duplicate')) {
					console.log(`  - Skipped duplicate profile: ${profile.email}`);
				} else {
					console.error(
						`  ✗ Failed to migrate profile ${profile.email}:`,
						error instanceof Error ? error.message : String(error)
					);
				}
			}
		}

		nextToken = response.nextToken;
	} while (nextToken);

	console.log(`✓ Migrated ${count} profiles\n`);
	return count;
}

async function migratePuzzles() {
	console.log('Migrating puzzles from DynamoDB to SQL...');
	let nextToken: string | null | undefined;
	let count = 0;

	do {
		const response = await client.models.Puzzle.list({ limit: 100, nextToken });

		for (const puzzle of response.data) {
			try {
				const puzData = JSON.parse(puzzle.puzJson as string);
				await client.models.SqlPuzzle.create({
					id: puzzle.id,
					puz_json: puzzle.puzJson as string,
					puz_key: puzzle.puzKey || null,
					title: puzData?.header?.title || null,
					author: puzData?.header?.author || null
				});
				count++;
				console.log(`  ✓ Migrated puzzle: ${puzData?.header?.title || puzzle.id}`);
			} catch (error) {
				if (error instanceof Error && error.message?.includes('duplicate')) {
					console.log(`  - Skipped duplicate puzzle: ${puzzle.id}`);
				} else {
					console.error(
						`  ✗ Failed to migrate puzzle ${puzzle.id}:`,
						error instanceof Error ? error.message : String(error)
					);
				}
			}
		}

		nextToken = response.nextToken;
	} while (nextToken);

	console.log(`✓ Migrated ${count} puzzles\n`);
	return count;
}

async function migrateUserPuzzles() {
	console.log('Migrating user puzzles from DynamoDB to SQL...');
	let nextToken: string | null | undefined;
	let count = 0;

	do {
		const response = await client.models.UserPuzzle.list({ limit: 100, nextToken });

		for (const userPuzzle of response.data) {
			try {
				await client.models.SqlUserPuzzle.create({
					id: userPuzzle.id,
					profile_id: userPuzzle.profileCompletedPuzzlesId,
					puzzle_id: userPuzzle.userPuzzlePuzzleId,
					used_check: userPuzzle.usedCheck,
					used_reveal: userPuzzle.usedReveal,
					used_clear: userPuzzle.usedClear,
					time_in_seconds: userPuzzle.timeInSeconds
				});
				count++;
				if (count % 10 === 0) {
					console.log(`  ✓ Migrated ${count} user puzzles...`);
				}
			} catch (error) {
				if (error instanceof Error && error.message?.includes('duplicate')) {
					// Skip silently
				} else {
					console.error(
						`  ✗ Failed to migrate user puzzle ${userPuzzle.id}:`,
						error instanceof Error ? error.message : String(error)
					);
				}
			}
		}

		nextToken = response.nextToken;
	} while (nextToken);

	console.log(`✓ Migrated ${count} user puzzles\n`);
	return count;
}

async function migrate() {
	console.log('Starting migration from DynamoDB to SQL...\n');

	try {
		const profileCount = await migrateProfiles();
		const puzzleCount = await migratePuzzles();
		const userPuzzleCount = await migrateUserPuzzles();

		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('Migration complete!');
		console.log(
			`Total: ${profileCount} profiles, ${puzzleCount} puzzles, ${userPuzzleCount} user puzzles`
		);
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	} catch (error) {
		console.error('Migration failed:', error);
		process.exit(1);
	}
}

migrate();
