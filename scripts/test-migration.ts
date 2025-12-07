import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import config from '../src/amplify_outputs.json';
import fs from 'fs';

const logFile = '/Users/xss/repo/jpc-crossword/migration.log';
fs.writeFileSync(logFile, `Migration started at ${new Date().toISOString()}\n\n`);

function log(message: string) {
	console.log(message);
	fs.appendFileSync(logFile, message + '\n');
}

Amplify.configure(config);
const client = generateClient<Schema>({ authMode: 'iam' });

async function testMigration() {
	log('Testing migration with one record of each type...\n');

	// Test Profile
	try {
		log('1. Fetching one Profile from DynamoDB...');
		const profileResponse = await client.models.Profile.list({ limit: 1 });
		const profile = profileResponse.data[0];
		log(`   Found profile: ${profile.email}`);

		log('   Available models: ' + Object.keys(client.models).join(', '));

		log('   Attempting to create in SQL...');
		// @ts-expect-error - SQL models might not be in types yet
		await client.models.profiles.create({
			id: profile.id + '-test',
			user_id: profile.userId,
			name: profile.name,
			email: profile.email
		});
		log('   ✓ Profile migration works!\n');
	} catch (error) {
		log(
			`   ✗ Profile migration failed: ${error instanceof Error ? error.message : String(error)}\n`
		);
	}

	// Test Puzzle
	try {
		log('2. Fetching one Puzzle from DynamoDB...');
		const puzzleResponse = await client.models.Puzzle.list({ limit: 1 });
		const puzzle = puzzleResponse.data[0];
		const puzData = JSON.parse(puzzle.puzJson as string);
		log(`   Found puzzle: ${puzData?.header?.title || puzzle.id}`);

		log('   Attempting to create in SQL...');
		// @ts-expect-error - SQL models might not be in types yet
		await client.models.puzzles.create({
			id: puzzle.id + '-test',
			puz_json: puzzle.puzJson as string,
			puz_key: puzzle.puzKey || null,
			title: puzData?.header?.title || null,
			author: puzData?.header?.author || null
		});
		log('   ✓ Puzzle migration works!\n');
	} catch (error) {
		log(
			`   ✗ Puzzle migration failed: ${error instanceof Error ? error.message : String(error)}\n`
		);
	}

	// Test UserPuzzle
	try {
		log('3. Fetching one UserPuzzle from DynamoDB...');
		const userPuzzleResponse = await client.models.UserPuzzle.list({ limit: 1 });
		const userPuzzle = userPuzzleResponse.data[0];
		log(`   Found user puzzle: ${userPuzzle.id}`);

		log('   Attempting to create in SQL...');
		// @ts-expect-error - SQL models might not be in types yet
		await client.models.user_puzzles.create({
			id: userPuzzle.id + '-test',
			profile_id: userPuzzle.profileCompletedPuzzlesId,
			puzzle_id: userPuzzle.userPuzzlePuzzleId,
			used_check: userPuzzle.usedCheck,
			used_reveal: userPuzzle.usedReveal,
			used_clear: userPuzzle.usedClear,
			time_in_seconds: userPuzzle.timeInSeconds
		});
		log('   ✓ UserPuzzle migration works!\n');
	} catch (error) {
		log(
			`   ✗ UserPuzzle migration failed: ${error instanceof Error ? error.message : String(error)}\n`
		);
	}

	log(`\nTest complete. Check ${logFile} for details.`);
}

testMigration();
