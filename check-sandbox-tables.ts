import mysql from 'mysql2/promise';

const main = async () => {
	const conn = await mysql.createConnection({
		host: 'amplify-sveltecrosswordapp-xss-crossworddb678d801a-jg1wxdjytofe.crjmzvttlbaa.us-west-2.rds.amazonaws.com',
		port: 3306,
		user: 'admin',
		password: 'CrosswordDB2024!',
		database: 'crossword'
	});

	try {
		const [tables] = await conn.execute('SHOW TABLES');
		console.log('Tables in sandbox database:', tables);
	} finally {
		await conn.end();
	}
};

main();
