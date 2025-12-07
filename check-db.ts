import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const getConnection = async () => {
	const connectionString = process.env.SQL_CONNECTION_STRING!;
	const url = new URL(connectionString);
	return mysql.createConnection({
		host: url.hostname,
		port: parseInt(url.port || '3306'),
		user: url.username,
		password: url.password,
		database: url.pathname.slice(1)
	});
};

const main = async () => {
	const conn = await getConnection();

	try {
		const [profiles] = await conn.execute('SELECT * FROM profiles LIMIT 10');
		console.log('Profiles:', profiles);

		const [puzzles] = await conn.execute('SELECT id, title, author FROM puzzles LIMIT 10');
		console.log('\nPuzzles:', puzzles);

		const [userPuzzles] = await conn.execute('SELECT * FROM user_puzzles LIMIT 10');
		console.log('\nUser Puzzles:', userPuzzles);
	} finally {
		await conn.end();
	}
};

main();
