import { haptic } from './haptics';
import type { CrosswordClues } from './types/types';
import { getNextPuzzle } from './sql/getNextPuzzle';

export const loadNextPuzzle = async (profileId: string): Promise<CrosswordClues | null> => {
	haptic();
	return getNextPuzzle(profileId);
};

export interface InitPuzzleCallbacks {
	onAuthenticated: (profile: { id: string; email: string }, puzzle: CrosswordClues | null) => void;
	onUnauthenticated: () => void;
	onError: (e: unknown) => void;
}

export const initializePuzzle = async (
	getUser: () => Promise<unknown>,
	getProfile: () => Promise<{ id: string; email: string }>,
	callbacks: InitPuzzleCallbacks
): Promise<void> => {
	try {
		await getUser();
	} catch {
		callbacks.onUnauthenticated();
		return;
	}
	try {
		const profile = await getProfile();
		const puzzle = await getNextPuzzle(profile.id);
		callbacks.onAuthenticated(profile, puzzle);
	} catch (e) {
		callbacks.onError(e);
	}
};
