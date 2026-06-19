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
	createTimer,
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

	describe('createTimer', () => {
		it('calls onTick after 1 second', () => {
			const onTick = vi.fn();
			const cancel = createTimer(onTick, () => true);
			vi.advanceTimersByTime(1000);
			expect(onTick).toHaveBeenCalledOnce();
			cancel();
		});
		it('stops when isComplete returns true', () => {
			const onTick = vi.fn();
			const cancel = createTimer(onTick, () => true);
			vi.advanceTimersByTime(3000);
			expect(onTick).toHaveBeenCalledOnce();
			cancel();
		});
		it('continues ticking when isComplete returns false', () => {
			const onTick = vi.fn();
			const cancel = createTimer(onTick, () => false);
			vi.advanceTimersByTime(3000);
			expect(onTick).toHaveBeenCalledTimes(3);
			cancel();
		});
		it('returned cancel function stops further ticks', () => {
			const onTick = vi.fn();
			const cancel = createTimer(onTick, () => false);
			vi.advanceTimersByTime(1000);
			cancel();
			vi.advanceTimersByTime(5000);
			expect(onTick).toHaveBeenCalledOnce();
		});
	});

	describe('submitPuzzleCompletion', () => {
		it('calls vibrate and invokes lambda with correct params', async () => {
			vi.useRealTimers();
			await submitPuzzleCompletion({
				profileId: 'prof-1',
				puzzleId: 'puz-1',
				usedCheck: true,
				usedClear: false,
				usedReveal: true,
				timeInSeconds: 42
			});
			expect(vibrate).toHaveBeenCalled();
			expect(InvokeCommand).toHaveBeenCalledWith(
				expect.objectContaining({
					FunctionName: 'test-function'
				})
			);
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
