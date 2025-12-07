import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const main = async () => {
	const conn = await mysql.createConnection({
		host: 'amplify-d34i7evdsl4uqo-main-br-crossworddb678d801a-aqzf68eplpji.crjmzvttlbaa.us-west-2.rds.amazonaws.com',
		port: 3306,
		user: 'admin',
		password: 'CrosswordDB2024!',
		database: 'crossword'
	});

	try {
		const testId = `direct-test-${Date.now()}`;
		await conn.execute(
			'INSERT INTO profiles (id, user_id, name, email) VALUES (?, ?, ?, ?)',
			[testId, 'test-user', 'Direct Test', 'direct@test.com']
		);
		console.log('✓ Inserted directly into RDS');

		const [rows] = await conn.execute('SELECT * FROM profiles WHERE id = ?', [testId]);
		console.log('✓ Verified:', rows);
	} finally {
		await conn.end();
	}
};

main();
