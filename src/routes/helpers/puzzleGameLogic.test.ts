import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./haptics', () => ({
	haptic: vi.fn().mockResolvedValue(undefined),
	vibrate: vi.fn().mockResolvedValue(undefined)
}));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('aws-amplify/auth', () => ({
	fetchAuthSession: vi
		.fn()
		.mockResolvedValue({ credentials: { accessKeyId: 'test', secretAccessKey: 'test' } })
}));
const mockSend = vi.fn().mockResolvedValue({});
vi.mock('@aws-sdk/client-lambda', () => ({
	LambdaClient: class {
		send = mockSend;
	},
	InvokeCommand: vi.fn()
}));
vi.mock('../../amplify_outputs.json', () => ({
	default: { custom: { sqlQueriesFunctionName: 'test-function' } }
}));
vi.mock('aws-amplify', () => ({ Amplify: { configure: vi.fn() } }));

import {
	handleToolbarAction,
	navigateToHistory,
	sleep,
	performSignOut,
	submitPuzzleCompletion
} from './puzzleGameLogic';
import { haptic, vibrate } from './haptics';
import { goto } from '$app/navigation';
import { InvokeCommand } from '@aws-sdk/client-lambda';

describe('puzzleGameLogic', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('submitPuzzleCompletion', () => {
		it('calls vibrate and invokes lambda with correct params', async () => {
			vi.useRealTimers();
			await submitPuzzleCompletion('prof-1', {
				phase: 'solved',
				puzzle: { id: 'puz-1', clues: [] },
				elapsedSeconds: 42,
				assists: { usedCheck: true, usedClear: false, usedReveal: true }
			});
			expect(vibrate).toHaveBeenCalled();
			expect(InvokeCommand).toHaveBeenCalledWith(
				expect.objectContaining({ FunctionName: 'test-function' })
			);
			const payload = JSON.parse(
				(InvokeCommand as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0].Payload
			);
			expect(payload).toMatchObject({
				query: 'createUserPuzzle',
				userPuzzle: {
					profile_id: 'prof-1',
					puzzle_id: 'puz-1',
					used_check: 1,
					used_clear: 0,
					used_reveal: 1,
					time_in_seconds: 42
				}
			});
		});
	});

	describe('handleToolbarAction', () => {
		it('calls haptic and the action', () => {
			const action = vi.fn();
			handleToolbarAction(action);
			expect(haptic).toHaveBeenCalled();
			expect(action).toHaveBeenCalled();
		});
	});

	describe('navigateToHistory', () => {
		it('navigates to /history', () => {
			navigateToHistory();
			expect(goto).toHaveBeenCalledWith('/history');
		});
	});

	describe('sleep', () => {
		it('resolves after the specified time', async () => {
			const promise = sleep(500);
			vi.advanceTimersByTime(500);
			await expect(promise).resolves.toBeUndefined();
		});
	});

	describe('performSignOut', () => {
		it('calls signOut, clears state, and navigates to login', async () => {
			const signOutFn = vi.fn().mockResolvedValue(undefined);
			const clearState = vi.fn();
			const promise = performSignOut(signOutFn, clearState);
			await vi.advanceTimersByTimeAsync(500);
			await promise;
			expect(haptic).toHaveBeenCalled();
			expect(signOutFn).toHaveBeenCalled();
			expect(clearState).toHaveBeenCalled();
			expect(goto).toHaveBeenCalledWith('/login');
		});
	});
});
