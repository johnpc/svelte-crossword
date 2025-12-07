import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import type { SqlSchema } from '../amplify/data/sql-resource';
import config from '../src/amplify_outputs.json';

Amplify.configure(config);

const ddbClient = generateClient<Schema>({ authMode: 'iam' });
const sqlClient = generateClient<SqlSchema>({ authMode: 'iam' });

async function migrateProfiles() {
	console.log('Migrating profiles...');
	let nextToken: string | null | undefined;
	let count = 0;

	do {
		const response = await ddbClient.models.Profile.list({ limit: 100, nextToken });

		for (const profile of response.data) {
			await sqlClient.models.Profile.create({
				id: profile.id,
				userId: profile.userId,
				name: profile.name,
				email: profile.email
			});
			count++;
		}

		nextToken = response.nextToken;
	} while (nextToken);

	console.log(`Migrated ${count} profiles`);
	return count;
}

async function migratePuzzles() {
	console.log('Migrating puzzles...');
	let nextToken: string | null | undefined;
	let count = 0;

	do {
		const response = await ddbClient.models.Puzzle.list({ limit: 100, nextToken });

		for (const puzzle of response.data) {
			const puzData = JSON.parse(puzzle.puzJson as string);
			await sqlClient.models.Puzzle.create({
				id: puzzle.id,
				puzJson: puzzle.puzJson,
				puzKey: puzzle.puzKey,
				title: puzData?.header?.title,
				author: puzData?.header?.author
			});
			count++;
		}

		nextToken = response.nextToken;
	} while (nextToken);

	console.log(`Migrated ${count} puzzles`);
	return count;
}

async function migrateUserPuzzles() {
	console.log('Migrating user puzzles...');
	let nextToken: string | null | undefined;
	let count = 0;

	do {
		const response = await ddbClient.models.UserPuzzle.list({ limit: 100, nextToken });

		for (const userPuzzle of response.data) {
			await sqlClient.models.UserPuzzle.create({
				id: userPuzzle.id,
				profileId: userPuzzle.profileCompletedPuzzlesId,
				puzzleId: userPuzzle.userPuzzlePuzzleId,
				usedCheck: userPuzzle.usedCheck,
				usedReveal: userPuzzle.usedReveal,
				usedClear: userPuzzle.usedClear,
				timeInSeconds: userPuzzle.timeInSeconds
			});
			count++;
		}

		nextToken = response.nextToken;
	} while (nextToken);

	console.log(`Migrated ${count} user puzzles`);
	return count;
}

async function migrate() {
	try {
		const profileCount = await migrateProfiles();
		const puzzleCount = await migratePuzzles();
		const userPuzzleCount = await migrateUserPuzzles();

		console.log('\nMigration complete!');
		console.log(
			`Total: ${profileCount} profiles, ${puzzleCount} puzzles, ${userPuzzleCount} user puzzles`
		);
	} catch (error) {
		console.error('Migration failed:', error);
		process.exit(1);
	}
}

migrate();
