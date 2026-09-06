import { Handler } from 'aws-lambda';
import mysql from 'mysql2/promise';

// Executes arbitrary parameterized SQL for laptop admin scripts
// (scripts/delete-user-account.ts etc.) now that the DB is private.
// Invocable ONLY via admin IAM credentials — unlike sql-queries, this
// function is never granted to the app's authenticated/guest user roles.
export const handler: Handler = async (event) => {
	const { sql, params } = event as { sql: string; params?: unknown[] };
	if (!sql || typeof sql !== 'string') {
		throw new Error('Payload must be { sql: string, params?: unknown[] }');
	}

	const url = new URL(process.env.SQL_CONNECTION_STRING!);
	const conn = await mysql.createConnection({
		host: url.hostname,
		port: parseInt(url.port || '3306'),
		user: url.username,
		password: url.password,
		database: url.pathname.slice(1)
	});

	try {
		const [rows] = await conn.execute(sql, params ?? []);
		return { rows };
	} finally {
		await conn.end();
	}
};
