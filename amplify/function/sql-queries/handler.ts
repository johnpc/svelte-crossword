import { Handler } from 'aws-lambda';
import mysql from 'mysql2/promise';

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

export const handler: Handler = async (event) => {
	const { query, profileId } = event;
	const conn = await getConnection();

	try {
		if (query === 'leaderboard') {
			const [rows] = await conn.execute(`
				SELECT 
					p.id,
					p.name,
					p.email,
					COUNT(up.id) as completedCount
				FROM profiles p
				LEFT JOIN user_puzzles up ON p.id = up.profile_id
				GROUP BY p.id, p.name, p.email
				ORDER BY completedCount DESC
				LIMIT 100
			`);
			return { statusCode: 200, body: JSON.stringify(rows) };
		}

		if (query === 'nextPuzzle' && profileId) {
			const [rows] = await conn.execute(
				`
				SELECT p.id, p.puz_json as puzJson
				FROM puzzles p
				WHERE p.id NOT IN (
					SELECT puzzle_id FROM user_puzzles WHERE profile_id = ?
				)
				ORDER BY p.created_at DESC
				LIMIT 1
			`,
				[profileId]
			);
			const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
			if (result) {
				result.puzJson = JSON.parse(result.puzJson);
			}
			return { statusCode: 200, body: JSON.stringify(result) };
		}

		return { statusCode: 400, body: 'Unknown query' };
	} finally {
		await conn.end();
	}
};
