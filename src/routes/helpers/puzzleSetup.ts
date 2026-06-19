import { haptic } from './haptics';
import { getNextPuzzle } from './sql/getNextPuzzle';
import type { CrosswordClues } from './types/types';
import { createTimer } from './puzzleGameLogic';

export const loadNextPuzzle = async (profileId: string): Promise<CrosswordClues> => {
	haptic();
	return getNextPuzzle(profileId);
};

export interface InitPuzzleCallbacks {
	onAuthenticated: (profile: { id: string; email: string }, puzzle: CrosswordClues) => void;
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

export const startPuzzleTimer = (onTick: () => void, isComplete: () => boolean): void => {
	createTimer(onTick, isComplete);
};
