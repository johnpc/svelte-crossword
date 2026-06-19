import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockHaptic = vi.fn();
const mockGetNextPuzzle = vi.fn();
vi.mock('./haptics', () => ({ haptic: () => mockHaptic() }));
vi.mock('./sql/getNextPuzzle', () => ({
	getNextPuzzle: (...args: unknown[]) => mockGetNextPuzzle(...args)
}));

import { loadNextPuzzle, initializePuzzle } from './puzzleInit';

const puzzle = { id: 'p-1', clues: [], title: 'T', author: 'A' };

describe('puzzleInit', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetNextPuzzle.mockResolvedValue(puzzle);
	});

	describe('loadNextPuzzle', () => {
		it('triggers haptic and returns the next puzzle', async () => {
			const result = await loadNextPuzzle('prof-1');
			expect(mockHaptic).toHaveBeenCalledOnce();
			expect(mockGetNextPuzzle).toHaveBeenCalledWith('prof-1');
			expect(result).toBe(puzzle);
		});
	});

	describe('initializePuzzle', () => {
		const profile = { id: 'prof-1', email: 'a@b.com' };

		it('calls onUnauthenticated when getUser rejects', async () => {
			const callbacks = {
				onAuthenticated: vi.fn(),
				onUnauthenticated: vi.fn(),
				onError: vi.fn()
			};
			await initializePuzzle(
				() => Promise.reject(new Error('no session')),
				() => Promise.resolve(profile),
				callbacks
			);
			expect(callbacks.onUnauthenticated).toHaveBeenCalledOnce();
			expect(callbacks.onAuthenticated).not.toHaveBeenCalled();
		});

		it('calls onAuthenticated with profile and puzzle on success', async () => {
			const callbacks = {
				onAuthenticated: vi.fn(),
				onUnauthenticated: vi.fn(),
				onError: vi.fn()
			};
			await initializePuzzle(
				() => Promise.resolve({}),
				() => Promise.resolve(profile),
				callbacks
			);
			expect(callbacks.onAuthenticated).toHaveBeenCalledWith(profile, puzzle);
		});

		it('calls onError when profile/puzzle loading throws', async () => {
			const callbacks = {
				onAuthenticated: vi.fn(),
				onUnauthenticated: vi.fn(),
				onError: vi.fn()
			};
			const boom = new Error('boom');
			await initializePuzzle(
				() => Promise.resolve({}),
				() => Promise.reject(boom),
				callbacks
			);
			expect(callbacks.onError).toHaveBeenCalledWith(boom);
		});
	});
});
