import { invokeSqlQuery } from './invokeSqlQuery';

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

type RawHistoryRow = {
	id: string;
	profile_id: string;
	puzzle_id: string;
	used_check: number;
	used_reveal: number;
	used_clear: number;
	time_in_seconds: number;
	created_at: string;
	title?: string;
	author?: string;
};

export const getUserHistory = async (profileId: string): Promise<UserHistoryEntry[]> => {
	const rows = await invokeSqlQuery<RawHistoryRow[]>({ query: 'getUserHistory', profileId });
	return rows.map((row) => ({
		id: row.id,
		profileId: row.profile_id,
		puzzleId: row.puzzle_id,
		usedCheck: Boolean(row.used_check),
		usedReveal: Boolean(row.used_reveal),
		usedClear: Boolean(row.used_clear),
		timeInSeconds: row.time_in_seconds,
		createdAt: row.created_at,
		puzzleTitle: row.title || undefined,
		puzzleAuthor: row.author || undefined
	}));
};
