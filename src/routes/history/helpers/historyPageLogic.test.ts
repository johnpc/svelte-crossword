import { describe, it, expect, vi } from 'vitest';
import { loadHistoryData, deleteAllUserData } from './historyPageLogic';

describe('loadHistoryData', () => {
	const baseDeps = () => ({
		getCurrentUser: vi.fn().mockResolvedValue({ userId: 'u1' }),
		getOrCreateProfile: vi.fn().mockResolvedValue({ id: 'p1' }),
		getUserHistory: vi.fn().mockResolvedValue([{ id: 'h1' }]),
		getStreakInfo: vi
			.fn()
			.mockResolvedValue({ currentStreak: 2, longestStreak: 5, allActivity: [] }),
		onUnauthenticated: vi.fn()
	});

	it('returns history and streak for an authenticated user', async () => {
		const deps = baseDeps();
		const result = await loadHistoryData(deps);
		expect(result).toEqual({
			completedPuzzles: [{ id: 'h1' }],
			streakInfo: { currentStreak: 2, longestStreak: 5, allActivity: [] }
		});
		expect(deps.getUserHistory).toHaveBeenCalledWith('p1');
		expect(deps.getStreakInfo).toHaveBeenCalledWith('p1');
		expect(deps.onUnauthenticated).not.toHaveBeenCalled();
	});

	it('redirects and returns null when not authenticated', async () => {
		const deps = baseDeps();
		deps.getCurrentUser.mockRejectedValue(new Error('no session'));
		const result = await loadHistoryData(deps);
		expect(result).toBeNull();
		expect(deps.onUnauthenticated).toHaveBeenCalledOnce();
		expect(deps.getOrCreateProfile).not.toHaveBeenCalled();
	});
});

describe('deleteAllUserData', () => {
	const baseDeps = () => ({
		confirm: vi.fn().mockReturnValue(true),
		resetPuzzleStoreDefaults: vi.fn(),
		deleteUser: vi.fn().mockResolvedValue(undefined),
		signOut: vi.fn().mockResolvedValue(undefined),
		onComplete: vi.fn()
	});

	it('deletes the account and signs out when confirmed', async () => {
		const deps = baseDeps();
		const ran = await deleteAllUserData(deps);
		expect(ran).toBe(true);
		expect(deps.resetPuzzleStoreDefaults).toHaveBeenCalledOnce();
		expect(deps.deleteUser).toHaveBeenCalledOnce();
		expect(deps.signOut).toHaveBeenCalledOnce();
		expect(deps.onComplete).toHaveBeenCalledOnce();
	});

	it('does nothing when the user cancels the confirm dialog', async () => {
		const deps = baseDeps();
		deps.confirm.mockReturnValue(false);
		const ran = await deleteAllUserData(deps);
		expect(ran).toBe(false);
		expect(deps.deleteUser).not.toHaveBeenCalled();
		expect(deps.signOut).not.toHaveBeenCalled();
		expect(deps.onComplete).not.toHaveBeenCalled();
	});
});
