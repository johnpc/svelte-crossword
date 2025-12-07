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
		// Insert test data
		await conn.execute(`
			INSERT INTO profiles (id, user_id, name, email, created_at, updated_at)
			VALUES 
				('p1', 'u1', 'Alice', 'alice@test.com', NOW(), NOW()),
				('p2', 'u2', 'Bob', 'bob@test.com', NOW(), NOW()),
				('p3', 'u3', 'Charlie', 'charlie@test.com', NOW(), NOW())
			ON DUPLICATE KEY UPDATE id=id
		`);

		await conn.execute(`
			INSERT INTO puzzles (id, puz_json, created_at, updated_at)
			VALUES 
				('pz1', '{}', NOW(), NOW()),
				('pz2', '{}', NOW(), NOW())
			ON DUPLICATE KEY UPDATE id=id
		`);

		await conn.execute(`
			INSERT INTO user_puzzles (id, profile_id, puzzle_id, used_check, used_reveal, used_clear, time_in_seconds, created_at, updated_at)
			VALUES 
				('up1', 'p1', 'pz1', 0, 0, 0, 120, NOW(), NOW()),
				('up2', 'p1', 'pz2', 0, 0, 0, 150, NOW(), NOW()),
				('up3', 'p2', 'pz1', 1, 0, 0, 200, NOW(), NOW())
			ON DUPLICATE KEY UPDATE id=id
		`);

		// Test leaderboard query
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

		console.log('Leaderboard results:', JSON.stringify(rows, null, 2));
	} finally {
		await conn.end();
	}
};

main();
