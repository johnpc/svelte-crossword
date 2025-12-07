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
	const { query, profileId, userId, email, name } = event;
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
				LEFT JOIN user_puzzles up ON p.id = up.puzzle_id AND up.profile_id = ?
				WHERE up.id IS NULL
				ORDER BY p.created_at DESC
				LIMIT 1
			`,
				[profileId]
			);
			const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
			if (result && typeof result === 'object' && 'puzJson' in result) {
				result.puzJson = JSON.parse(result.puzJson as string);
			}
			return { statusCode: 200, body: JSON.stringify(result) };
		}

		if (query === 'getProfile' && userId) {
			const [rows] = await conn.execute(
				'SELECT id, user_id, name, email FROM profiles WHERE id = ?',
				[userId]
			);
			const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
			return { statusCode: 200, body: JSON.stringify(result) };
		}

		if (query === 'createProfile' && userId && email && name) {
			await conn.execute('INSERT INTO profiles (id, user_id, name, email) VALUES (?, ?, ?, ?)', [
				userId,
				userId,
				name,
				email
			]);
			const [rows] = await conn.execute(
				'SELECT id, user_id, name, email FROM profiles WHERE id = ?',
				[userId]
			);
			const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
			return { statusCode: 200, body: JSON.stringify(result) };
		}

		if (query === 'getUserHistory' && profileId) {
			const [rows] = await conn.execute(
				`
				SELECT 
					up.id,
					up.profile_id,
					up.puzzle_id,
					up.used_check,
					up.used_reveal,
					up.used_clear,
					up.time_in_seconds,
					up.created_at,
					p.title,
					p.author
				FROM user_puzzles up
				LEFT JOIN puzzles p ON up.puzzle_id = p.id
				WHERE up.profile_id = ?
				ORDER BY up.created_at DESC
			`,
				[profileId]
			);
			return { statusCode: 200, body: JSON.stringify(rows) };
		}

		if (query === 'getStreakInfo' && profileId) {
			const [rows] = await conn.execute(
				'SELECT created_at FROM user_puzzles WHERE profile_id = ? ORDER BY created_at DESC',
				[profileId]
			);
			return { statusCode: 200, body: JSON.stringify(rows) };
		}

		if (query === 'getUserPuzzle' && event.userPuzzleId) {
			const [rows] = await conn.execute(
				'SELECT id, profile_id, puzzle_id, used_check, used_reveal, used_clear, time_in_seconds, created_at FROM user_puzzles WHERE id = ?',
				[event.userPuzzleId]
			);
			const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
			return { statusCode: 200, body: JSON.stringify(result) };
		}

		if (query === 'getPuzzle' && event.puzzleId) {
			const [rows] = await conn.execute(
				'SELECT id, puz_json, title, author FROM puzzles WHERE id = ?',
				[event.puzzleId]
			);
			const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
			if (result && typeof result === 'object' && 'puz_json' in result) {
				result.puz_json = JSON.parse(result.puz_json as string);
			}
			return { statusCode: 200, body: JSON.stringify(result) };
		}

		if (query === 'createUserPuzzle' && event.userPuzzle) {
			const { id, profile_id, puzzle_id, used_check, used_clear, used_reveal, time_in_seconds } =
				event.userPuzzle;
			await conn.execute(
				'INSERT INTO user_puzzles (id, profile_id, puzzle_id, used_check, used_clear, used_reveal, time_in_seconds) VALUES (?, ?, ?, ?, ?, ?, ?)',
				[id, profile_id, puzzle_id, used_check, used_clear, used_reveal, time_in_seconds]
			);
			return { statusCode: 200, body: JSON.stringify({ success: true }) };
		}

		if (query === 'createPuzzle' && event.puzzle) {
			const { id, puz_json, puz_key, title, author } = event.puzzle;
			await conn.execute(
				'INSERT IGNORE INTO puzzles (id, puz_json, puz_key, title, author) VALUES (?, ?, ?, ?, ?)',
				[id, puz_json, puz_key, title, author]
			);
			return { statusCode: 200, body: JSON.stringify({ success: true }) };
		}

		return { statusCode: 400, body: 'Unknown query' };
	} finally {
		await conn.end();
	}
};
