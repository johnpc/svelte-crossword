import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const getConnection = async (connectionString: string) => {
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
	// Clean main branch database
	console.log('Cleaning main branch database...');
	const mainConn = await getConnection(process.env.SQL_CONNECTION_STRING!);
	
	try {
		await mainConn.execute('DELETE FROM user_puzzles WHERE id IN ("up1", "up2", "up3")');
		await mainConn.execute('DELETE FROM profiles WHERE id IN ("p1", "p2", "p3")');
		await mainConn.execute('DELETE FROM puzzles WHERE id IN ("pz1", "pz2")');
		console.log('✓ Deleted test data from main branch\n');
	} finally {
		await mainConn.end();
	}

	// Check sandbox database
	console.log('Checking sandbox database...');
	const sandboxConn = await getConnection(
		'mysql://admin:CrosswordDB2024!@amplify-sveltecrosswordapp-xss-crossworddb678d801a-jg1wxdjytofe.crjmzvttlbaa.us-west-2.rds.amazonaws.com:3306/crossword'
	);

	try {
		const [profiles] = await sandboxConn.execute('SELECT COUNT(*) as count FROM profiles');
		console.log('Profiles:', profiles);

		const [puzzles] = await sandboxConn.execute('SELECT COUNT(*) as count FROM puzzles');
		console.log('Puzzles:', puzzles);

		const [userPuzzles] = await sandboxConn.execute('SELECT COUNT(*) as count FROM user_puzzles');
		console.log('User Puzzles:', userPuzzles);

		const [sampleProfiles] = await sandboxConn.execute('SELECT id, name, email FROM profiles LIMIT 5');
		console.log('\nSample profiles:', sampleProfiles);
	} finally {
		await sandboxConn.end();
	}
};

main();
