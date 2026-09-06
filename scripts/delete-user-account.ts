// The RDS instance is private (no public IP, security group admits only the
// sql-queries Lambda and the admin tunnel endpoint), so this script cannot
// connect to the DB hostname directly. Run ./scripts/db-tunnel.sh in another
// terminal first, then invoke this with the connection-string host swapped to
// 127.0.0.1:3306.
import { execSync } from 'child_process';
import mysql from 'mysql2/promise';

const DRY_RUN = process.env.DRY_RUN !== 'false'; // Set DRY_RUN=false to actually delete

async function getConnection() {
	if (!process.env.SQL_CONNECTION_STRING) {
		throw new Error('SQL_CONNECTION_STRING environment variable is required');
	}
	const url = new URL(process.env.SQL_CONNECTION_STRING);
	return mysql.createConnection({
		host: url.hostname,
		port: parseInt(url.port || '3306'),
		user: url.username,
		password: url.password,
		database: url.pathname.slice(1)
	});
}

async function deleteUserAccount(email: string) {
	console.log(`\n${'='.repeat(60)}`);
	console.log(`🔍 Account Deletion Analysis for: ${email}`);
	console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE DELETE'}`);
	console.log(`${'='.repeat(60)}\n`);

	const conn = await getConnection();

	// 1. Find Cognito user
	console.log('1️⃣  Checking Cognito User Pool...');
	let cognitoUsername: string | null = null;
	const userPoolId = process.env.COGNITO_USER_POOL_ID;
	if (!userPoolId) {
		throw new Error('COGNITO_USER_POOL_ID environment variable is required');
	}
	try {
		const result = execSync(
			`aws cognito-idp admin-get-user --user-pool-id ${userPoolId} --username "${email}" --region us-west-2`,
			{ encoding: 'utf-8' }
		);
		const userData = JSON.parse(result);
		cognitoUsername = userData.Username;
		console.log(`   ✅ Found Cognito user: ${cognitoUsername}`);
		console.log(`   📅 Created: ${userData.UserCreateDate}`);
		console.log(`   📊 Status: ${userData.UserStatus}`);
	} catch (error) {
		if (error instanceof Error && error.message?.includes('UserNotFoundException')) {
			console.log(`   ⚠️  No Cognito user found`);
		} else {
			console.log(
				`   ❌ Error checking Cognito: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	// 2. Check SQL Profile
	console.log('\n2️⃣  Checking SQL Profile table...');
	let profile: { id: string; user_id: string; name: string; email: string } | null = null;
	try {
		const [rows] = await conn.execute(
			'SELECT id, user_id, name, email FROM profiles WHERE id = ?',
			[cognitoUsername]
		);
		profile = Array.isArray(rows) && rows.length > 0 ? (rows[0] as typeof profile) : null;
		if (profile) {
			console.log(`   ✅ Found SQL profile:`);
			console.log(`      - ID: ${profile.id}`);
			console.log(`      - User ID: ${profile.user_id}`);
			console.log(`      - Name: ${profile.name}`);
			console.log(`      - Email: ${profile.email}`);
		} else {
			console.log(`   ⚠️  No SQL profile found`);
		}
	} catch (error) {
		console.log(
			`   ❌ Error checking SQL: ${error instanceof Error ? error.message : String(error)}`
		);
	}

	// 3. Check completed puzzles
	console.log('\n3️⃣  Checking completed puzzles...');
	let userPuzzles: Array<{
		id: string;
		puzzle_id: string;
		time_in_seconds: number;
		title: string;
		author: string;
	}> = [];
	if (profile) {
		try {
			const [rows] = await conn.execute(
				`SELECT up.id, up.puzzle_id, up.time_in_seconds, p.title, p.author
         FROM user_puzzles up
         LEFT JOIN puzzles p ON up.puzzle_id = p.id
         WHERE up.profile_id = ?
         ORDER BY up.created_at DESC`,
				[profile.id]
			);
			userPuzzles = Array.isArray(rows) ? (rows as typeof userPuzzles) : [];
			console.log(`   ✅ Found ${userPuzzles.length} completed puzzle(s):`);
			userPuzzles.forEach((p, i) => {
				console.log(`      ${i + 1}. "${p.title}" by ${p.author} (${p.time_in_seconds}s)`);
			});
		} catch (error) {
			console.log(
				`   ❌ Error checking puzzles: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	// 4. Summary and deletion plan
	console.log(`\n${'='.repeat(60)}`);
	console.log('📋 DELETION PLAN:');
	console.log(`${'='.repeat(60)}`);

	if (cognitoUsername) {
		console.log(`\n✓ Delete Cognito user: ${cognitoUsername}`);
	}

	if (userPuzzles.length > 0) {
		console.log(`✓ Delete ${userPuzzles.length} SQL UserPuzzle records`);
	}

	if (profile) {
		console.log(`✓ Delete SQL Profile: ${profile.id}`);
	}

	if (DRY_RUN) {
		console.log(`\n⚠️  DRY RUN MODE - No changes made`);
		console.log(`Set DRY_RUN = false to execute deletion`);
	} else {
		console.log(`\n🔥 EXECUTING DELETION...`);

		// Delete SQL UserPuzzles first (foreign key constraint)
		for (const puzzle of userPuzzles) {
			await conn.execute('DELETE FROM user_puzzles WHERE id = ?', [puzzle.id]);
			console.log(`   ✅ Deleted UserPuzzle: ${puzzle.id}`);
		}

		// Delete SQL Profile
		if (profile) {
			await conn.execute('DELETE FROM profiles WHERE id = ?', [profile.id]);
			console.log(`   ✅ Deleted Profile: ${profile.id}`);
		}

		// Delete Cognito user
		if (cognitoUsername) {
			execSync(
				`aws cognito-idp admin-delete-user --user-pool-id ${userPoolId} --username ${cognitoUsername} --region us-west-2`
			);
			console.log(`   ✅ Deleted Cognito user: ${cognitoUsername}`);
		}

		console.log(`\n✅ Account deletion complete!`);
	}

	await conn.end();
	console.log(`\n${'='.repeat(60)}\n`);
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
	console.error('Usage: npx tsx delete-user-account.ts <email>');
	console.error('Example: npx tsx delete-user-account.ts user@example.com');
	console.error(
		'\nTo actually delete (not dry-run): DRY_RUN=false npx tsx delete-user-account.ts <email>'
	);
	process.exit(1);
}

deleteUserAccount(email).catch(console.error);
