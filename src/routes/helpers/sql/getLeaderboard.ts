import { generateClient } from 'aws-amplify/data';
import type { SqlSchema } from '../../../../amplify/data/sql-resource';

const client = generateClient<SqlSchema>({ authMode: 'iam' });

export async function getLeaderboard() {
	// Single query with join and aggregation
	const result = await client.queries.custom({
		query: `
      SELECT 
        p.id,
        p.name,
        p.email,
        COUNT(up.id) as completed_count
      FROM profiles p
      LEFT JOIN user_puzzles up ON p.id = up.profile_id
      GROUP BY p.id, p.name, p.email
      ORDER BY completed_count DESC
      LIMIT 100
    `
	});

	return result.data;
}
