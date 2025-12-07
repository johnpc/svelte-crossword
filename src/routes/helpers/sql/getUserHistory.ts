import type { Schema } from '../../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>({ authMode: 'userPool' });

export type UserHistoryEntry = {
	id: string;
	profileId: string;
	puzzleId: string;
	usedCheck: boolean;
	usedReveal: boolean;
	usedClear: boolean;
	timeInSeconds: number;
	createdAt: string;
	puzzleTitle?: string;
	puzzleAuthor?: string;
};

export const getUserHistory = async (profileId: string): Promise<UserHistoryEntry[]> => {
	const userPuzzles = await client.models.SqlUserPuzzle.list({
		filter: { profile_id: { eq: profileId } },
		limit: 10000
	});

	const puzzleIds = Array.from(new Set(userPuzzles.data.map((up) => up.puzzle_id)));
	const puzzles = await Promise.all(puzzleIds.map((id) => client.models.SqlPuzzle.get({ id })));

	const puzzleMap = new Map(puzzles.map((p) => [p.data?.id, p.data]));

	return userPuzzles.data
		.map((up) => {
			const puzzle = puzzleMap.get(up.puzzle_id);
			return {
				id: up.id,
				profileId: up.profile_id,
				puzzleId: up.puzzle_id,
				usedCheck: Boolean(up.used_check),
				usedReveal: Boolean(up.used_reveal),
				usedClear: Boolean(up.used_clear),
				timeInSeconds: up.time_in_seconds,
				createdAt: up.created_at,
				puzzleTitle: puzzle?.title || undefined,
				puzzleAuthor: puzzle?.author || undefined
			};
		})
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
