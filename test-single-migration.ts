import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from './amplify/data/resource';
import config from './src/amplify_outputs.json';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

Amplify.configure(config);
const client = generateClient<Schema>({ authMode: 'iam' });

const checkProdDb = async () => {
	const conn = await mysql.createConnection({
		host: 'amplify-d34i7evdsl4uqo-main-br-crossworddb678d801a-aqzf68eplpji.crjmzvttlbaa.us-west-2.rds.amazonaws.com',
		port: 3306,
		user: 'admin',
		password: 'CrosswordDB2024!',
		database: 'crossword'
	});

	try {
		const [profiles] = await conn.execute('SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5');
		return profiles;
	} finally {
		await conn.end();
	}
};

const main = async () => {
	console.log('1. Fetching one profile from DynamoDB...');
	const response = await client.models.Profile.list({ limit: 1 });
	const profile = response.data[0];
	
	if (!profile) {
		console.log('No profiles found in DynamoDB');
		return;
	}
	
	console.log(`   Found: ${profile.email}\n`);

	console.log('2. Creating in SQL via Amplify...');
	try {
		await client.models.SqlProfile.create({
			id: `test-${Date.now()}`,
			user_id: profile.userId,
			name: profile.name,
			email: `test-${profile.email}`
		});
		console.log('   ✓ Created via Amplify\n');
	} catch (error) {
		console.log('   ✗ Failed:', error instanceof Error ? error.message : String(error));
	}

	console.log('3. Checking prod database directly...');
	const records = await checkProdDb();
	console.log('   Records in prod DB:', records);
};

main();
