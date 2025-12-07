import { generateClient } from 'aws-amplify/data';
import type { SqlSchema } from '../../../../amplify/data/sql-resource';

const client = generateClient<SqlSchema>({ authMode: 'userPool' });

export async function getUserHistory(profileId: string) {
	// Single query with join - no client-side filtering needed
	const result = await client.queries.custom({
		query: `
      SELECT 
        up.id,
        up.time_in_seconds,
        up.used_check,
        up.used_reveal,
        up.used_clear,
        up.created_at,
        pz.title,
        pz.author
      FROM user_puzzles up
      JOIN puzzles pz ON up.puzzle_id = pz.id
      WHERE up.profile_id = ?
      ORDER BY up.created_at DESC
    `,
		variables: [profileId]
	});

	return result.data;
}
