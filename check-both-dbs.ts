import mysql from 'mysql2/promise';

const checkDb = async (name: string, host: string) => {
	const conn = await mysql.createConnection({
		host,
		port: 3306,
		user: 'admin',
		password: 'CrosswordDB2024!',
		database: 'crossword'
	});

	try {
		const [profiles] = await conn.execute('SELECT COUNT(*) as count FROM profiles');
		const [puzzles] = await conn.execute('SELECT COUNT(*) as count FROM puzzles');
		const [userPuzzles] = await conn.execute('SELECT COUNT(*) as count FROM user_puzzles');
		
		console.log(`\n${name}:`);
		console.log('  Profiles:', (profiles as any)[0].count);
		console.log('  Puzzles:', (puzzles as any)[0].count);
		console.log('  User Puzzles:', (userPuzzles as any)[0].count);
	} finally {
		await conn.end();
	}
};

const main = async () => {
	await checkDb('Main Branch DB', 'amplify-d34i7evdsl4uqo-main-br-crossworddb678d801a-aqzf68eplpji.crjmzvttlbaa.us-west-2.rds.amazonaws.com');
	await checkDb('Sandbox DB', 'amplify-sveltecrosswordapp-xss-crossworddb678d801a-jg1wxdjytofe.crjmzvttlbaa.us-west-2.rds.amazonaws.com');
};

main();
