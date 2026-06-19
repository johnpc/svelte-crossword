import { haptic, vibrate } from './haptics';
import { goto } from '$app/navigation';
import { fetchAuthSession } from 'aws-amplify/auth';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { Amplify } from 'aws-amplify';
import config from '../../amplify_outputs.json';

Amplify.configure(config);
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

export const getFunctionName = (cfg: { custom?: { sqlQueriesFunctionName?: string } }): string => {
	const name = cfg?.custom?.sqlQueriesFunctionName;
	if (!name) throw new Error('SQL queries function name not found in config');
	return name;
};

export const submitPuzzleCompletion = async (params: PuzzleCompletionParams): Promise<void> => {
	vibrate();
	const session = await fetchAuthSession();
	const lambda = new LambdaClient({ region: 'us-west-2', credentials: session.credentials });
	const functionName = getFunctionName(config);
	const command = new InvokeCommand({
		FunctionName: functionName,
		Payload: JSON.stringify({
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
		})
	});
	await lambda.send(command);
};

export const createTimer = (onTick: () => void, isComplete: () => boolean): void => {
	setTimeout(() => {
		onTick();
		if (!isComplete()) {
			createTimer(onTick, isComplete);
		}
	}, 1000);
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
