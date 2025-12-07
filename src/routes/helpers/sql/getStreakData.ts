import { generateClient } from 'aws-amplify/data';
import type { SqlSchema } from '../../../../amplify/data/sql-resource';

const client = generateClient<SqlSchema>({ authMode: 'userPool' });

export async function getStreakData(profileId: string) {
	// Database-level aggregation by date
	const result = await client.queries.custom({
		query: `
      SELECT 
        DATE(created_at) as puzzle_date,
        COUNT(*) as puzzles_completed,
        MIN(time_in_seconds) as best_time
      FROM user_puzzles
      WHERE profile_id = ?
      GROUP BY DATE(created_at)
      ORDER BY puzzle_date DESC
    `,
		variables: [profileId]
	});

	return result.data;
}

export async function getUserStats(profileId: string) {
	// Get aggregated stats in one query
	const result = await client.queries.custom({
		query: `
      SELECT 
        COUNT(*) as total_puzzles,
        AVG(time_in_seconds) as avg_time,
        MIN(time_in_seconds) as best_time,
        SUM(CASE WHEN used_check THEN 1 ELSE 0 END) as check_count,
        SUM(CASE WHEN used_reveal THEN 1 ELSE 0 END) as reveal_count
      FROM user_puzzles
      WHERE profile_id = ?
    `,
		variables: [profileId]
	});

	return result.data[0];
}
