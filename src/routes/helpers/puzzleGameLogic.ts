import { haptic, vibrate } from './haptics';
import { goto } from '$app/navigation';
import { invokeSqlQuery } from './sql/invokeSqlQuery';

export { loadNextPuzzle, initializePuzzle } from './puzzleInit';
export type { InitPuzzleCallbacks } from './puzzleInit';

export interface PuzzleCompletionParams {
	profileId: string;
	puzzleId: string;
	usedCheck: boolean;
	usedClear: boolean;
	usedReveal: boolean;
	timeInSeconds: number;
}

export const submitPuzzleCompletion = async (params: PuzzleCompletionParams): Promise<void> => {
	vibrate();
	await invokeSqlQuery({
		query: 'createUserPuzzle',
		userPuzzle: {
			id: crypto.randomUUID(),
			profile_id: params.profileId,
			puzzle_id: params.puzzleId,
			used_check: params.usedCheck ? 1 : 0,
			used_clear: params.usedClear ? 1 : 0,
			used_reveal: params.usedReveal ? 1 : 0,
			time_in_seconds: params.timeInSeconds
		}
	});
};

export const createTimer = (onTick: () => void, isComplete: () => boolean): (() => void) => {
	let cancelled = false;
	const id = setInterval(() => {
		if (cancelled) return;
		onTick();
		if (isComplete()) clearInterval(id);
	}, 1000);
	return () => {
		cancelled = true;
		clearInterval(id);
	};
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
