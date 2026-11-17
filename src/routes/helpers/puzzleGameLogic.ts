import { haptic, vibrate } from './haptics';
import { goto } from '$app/navigation';
import { invokeSqlQuery } from './sql/invokeSqlQuery';
import type { SolvedSession } from './session/puzzleSessionStore';

export { loadNextPuzzle, initializePuzzle } from './puzzleInit';
export type { InitPuzzleCallbacks } from './puzzleInit';

/** Records a solved sitting for the profile. Called once per playing -> solved transition. */
export const submitPuzzleCompletion = async (
	profileId: string,
	solved: SolvedSession
): Promise<void> => {
	vibrate();
	await invokeSqlQuery({
		query: 'createUserPuzzle',
		userPuzzle: {
			id: crypto.randomUUID(),
			profile_id: profileId,
			puzzle_id: solved.puzzle.id,
			used_check: solved.assists.usedCheck ? 1 : 0,
			used_clear: solved.assists.usedClear ? 1 : 0,
			used_reveal: solved.assists.usedReveal ? 1 : 0,
			time_in_seconds: solved.elapsedSeconds
		}
	});
};

export const handleToolbarAction = (action: () => void): void => {
	haptic();
	action();
};

export const navigateToHistory = (): void => {
	goto('/history');
};

export const sleep = (milliseconds: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const performSignOut = async (
	signOutFn: () => Promise<unknown>,
	clearState: () => void
): Promise<void> => {
	haptic();
	await signOutFn();
	clearState();
	await sleep(500);
	goto('/login');
};
