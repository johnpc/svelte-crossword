import { describe, it, expect, vi } from 'vitest';
import { loadHistoryDetail } from './historyDetailLogic';

const result = {
	userPuzzle: {
		time_in_seconds: 60,
		used_check: 0,
		used_clear: 0,
		used_reveal: 0,
		puzzle_id: 'puz-1'
	},
	clues: [{ answer: 'CAT' }] as never
};

const baseDeps = () => ({
	getCurrentUser: vi.fn().mockResolvedValue({ userId: 'u1' }),
	fetchPuzzleById: vi.fn().mockResolvedValue(result),
	getPuzzleId: vi.fn().mockReturnValue('up-1'),
	onUnauthenticated: vi.fn()
});

describe('loadHistoryDetail', () => {
	it('loads the puzzle for the id in the query string', async () => {
		const deps = baseDeps();
		const detail = await loadHistoryDetail(deps);
		expect(deps.fetchPuzzleById).toHaveBeenCalledWith('up-1');
		expect(detail).toEqual({ userPuzzle: result.userPuzzle, clues: result.clues });
	});

	it('redirects and returns null when unauthenticated', async () => {
		const deps = baseDeps();
		deps.getCurrentUser.mockRejectedValue(new Error('no session'));
		const detail = await loadHistoryDetail(deps);
		expect(detail).toBeNull();
		expect(deps.onUnauthenticated).toHaveBeenCalledOnce();
		expect(deps.fetchPuzzleById).not.toHaveBeenCalled();
	});

	it('returns null when no id is present', async () => {
		const deps = baseDeps();
		deps.getPuzzleId.mockReturnValue(null);
		const detail = await loadHistoryDetail(deps);
		expect(detail).toBeNull();
		expect(deps.fetchPuzzleById).not.toHaveBeenCalled();
	});
});
