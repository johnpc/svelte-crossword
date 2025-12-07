import mysql from 'mysql2/promise';

const databases = [
	{
		name: 'Main Branch',
		host: 'amplify-d34i7evdsl4uqo-main-br-crossworddb678d801a-aqzf68eplpji.crjmzvttlbaa.us-west-2.rds.amazonaws.com'
	},
	{
		name: 'Sandbox',
		host: 'amplify-sveltecrosswordapp-xss-crossworddb678d801a-jg1wxdjytofe.crjmzvttlbaa.us-west-2.rds.amazonaws.com'
	}
];

const checkDb = async (name: string, host: string) => {
	try {
		const conn = await mysql.createConnection({
			host,
			port: 3306,
			user: 'admin',
			password: 'CrosswordDB2024!',
			database: 'crossword'
		});

		const [profiles] = await conn.execute('SELECT COUNT(*) as count FROM profiles');
		const [puzzles] = await conn.execute('SELECT COUNT(*) as count FROM puzzles');
		const [userPuzzles] = await conn.execute('SELECT COUNT(*) as count FROM user_puzzles');
		
		const profileCount = (profiles as any)[0].count;
		const puzzleCount = (puzzles as any)[0].count;
		const userPuzzleCount = (userPuzzles as any)[0].count;
		
		console.log(`\n${name}:`);
		console.log(`  Profiles: ${profileCount}`);
		console.log(`  Puzzles: ${puzzleCount}`);
		console.log(`  User Puzzles: ${userPuzzleCount}`);
		
		if (profileCount > 0) {
			const [sample] = await conn.execute('SELECT email FROM profiles LIMIT 3');
			console.log('  Sample profiles:', sample);
		}
		
		await conn.end();
	} catch (error) {
		console.log(`\n${name}: ERROR - ${error instanceof Error ? error.message : String(error)}`);
	}
};

const main = async () => {
	console.log('Checking all RDS databases for migration data...');
	for (const db of databases) {
		await checkDb(db.name, db.host);
	}
};

main();
