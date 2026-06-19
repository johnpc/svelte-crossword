import type { Clue } from '../../helpers/types/types';
import type { FetchPuzzleResult, UserPuzzleData } from './fetchPuzzleById';

export interface HistoryDetailDeps {
	getCurrentUser: () => Promise<unknown>;
	fetchPuzzleById: (userPuzzleId: string) => Promise<FetchPuzzleResult>;
	getPuzzleId: () => string | null;
	onUnauthenticated: () => void;
}

export type HistoryDetail = {
	userPuzzle: UserPuzzleData;
	clues: Clue[];
};

/**
 * Loads a single previously-completed puzzle (by its user-puzzle id from the
 * query string). Redirects via onUnauthenticated when no session exists.
 */
export const loadHistoryDetail = async (deps: HistoryDetailDeps): Promise<HistoryDetail | null> => {
	try {
		await deps.getCurrentUser();
	} catch {
		deps.onUnauthenticated();
		return null;
	}
	const userPuzzleId = deps.getPuzzleId();
	if (!userPuzzleId) return null;
	const result = await deps.fetchPuzzleById(userPuzzleId);
	return { userPuzzle: result.userPuzzle, clues: result.clues };
};
