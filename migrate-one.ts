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

const main = async () => {
	console.log('1. Fetching one profile from DynamoDB...');
	const response = await client.models.Profile.list({ limit: 1 });
	const profile = response.data[0];
	
	if (!profile) {
		console.log('No profiles found');
		return;
	}
	
	console.log(`   Found: ${profile.email}\n`);

	console.log('2. Connecting to RDS...');
	const conn = await getConnection();
	
	try {
		console.log('3. Inserting into RDS...');
		await conn.execute(
			'INSERT INTO profiles (id, user_id, name, email, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE id=id',
			[profile.id, profile.userId, profile.name, profile.email]
		);
		console.log('   ✓ Inserted\n');

		console.log('4. Verifying in RDS...');
		const [rows] = await conn.execute('SELECT * FROM profiles WHERE id = ?', [profile.id]);
		console.log('   ✓ Verified:', rows);
	} finally {
		await conn.end();
	}
};

main();
