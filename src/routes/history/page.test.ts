import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';

const mockGoto = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockSignOut = vi.fn();
const mockDeleteUser = vi.fn();
const mockGetOrCreateProfile = vi.fn();
const mockGetUserHistory = vi.fn();
const mockGetStreakInfo = vi.fn();

vi.mock('aws-amplify', () => ({ Amplify: { configure: vi.fn() } }));
vi.mock('../../amplify_outputs.json', () => ({ default: { custom: {} } }));
vi.mock('$app/navigation', () => ({ goto: (...a: unknown[]) => mockGoto(...a) }));
vi.mock('aws-amplify/auth', () => ({
	getCurrentUser: () => mockGetCurrentUser(),
	signOut: () => mockSignOut(),
	deleteUser: () => mockDeleteUser()
}));
vi.mock('../helpers/sql/getOrCreateProfile', () => ({
	getOrCreateProfile: () => mockGetOrCreateProfile()
}));
vi.mock('../helpers/sql/getUserHistory', () => ({
	getUserHistory: (id: string) => mockGetUserHistory(id)
}));
vi.mock('../helpers/sql/getStreakInfo', () => ({
	getStreakInfo: (id: string) => mockGetStreakInfo(id)
}));
// Stub the heavy calendar component + its plugin so onMount renders cheaply.
vi.mock('@event-calendar/core', () => ({ Calendar: () => {}, DayGrid: {} }));

import Page from './+page.svelte';

const puzzle = {
	id: 'up-1',
	profileId: 'p-1',
	puzzleId: 'puz-1',
	usedCheck: true,
	usedReveal: false,
	usedClear: true,
	timeInSeconds: 125,
	createdAt: '2026-01-05T10:00:00.000Z'
};

const streakInfo = {
	longestStreak: 4,
	currentStreak: 2,
	allActivity: [{ date: new Date('2026-01-05T00:00:00.000Z'), count: 1 }]
};

describe('history/+page.svelte', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetCurrentUser.mockResolvedValue({ userId: 'u-1' });
		mockGetOrCreateProfile.mockResolvedValue({ id: 'p-1' });
		mockGetUserHistory.mockResolvedValue([puzzle]);
		mockGetStreakInfo.mockResolvedValue(streakInfo);
		vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
	});

	it('shows the loading spinner before data resolves', () => {
		mockGetUserHistory.mockReturnValue(new Promise(() => {}));
		const { container } = render(Page);
		// SyncLoader renders an animated spinner wrapper.
		expect(container.querySelector('p')).toBeTruthy();
		expect(container.textContent).not.toContain("You've completed");
	});

	it('renders HistoryStats and a HistoryEntry after mount with data', async () => {
		const { getByText } = render(Page);
		await waitFor(() => expect(getByText("You've completed 1 puzzles!")).toBeInTheDocument());
		// HistoryEntry renders a per-puzzle "Solved in" line.
		expect(getByText(/Solved in/)).toBeInTheDocument();
		// HistoryStats summary line.
		expect(getByText(/Current streak/)).toBeInTheDocument();
	});

	it('shows the empty-history message when there are no completed puzzles', async () => {
		mockGetUserHistory.mockResolvedValue([]);
		const { getByText } = render(Page);
		await waitFor(() => expect(getByText(/not completed any puzzles/i)).toBeInTheDocument());
	});

	it('does not delete the account when the user cancels the confirm dialog', async () => {
		vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
		const { getByText } = render(Page);
		await waitFor(() => expect(getByText("You've completed 1 puzzles!")).toBeInTheDocument());
		await fireEvent.click(getByText(/Delete my account/i));
		expect(mockDeleteUser).not.toHaveBeenCalled();
	});

	it('deletes the account and signs out when the user confirms', async () => {
		vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
		mockDeleteUser.mockResolvedValue(undefined);
		mockSignOut.mockResolvedValue(undefined);
		const { getByText } = render(Page);
		await waitFor(() => expect(getByText("You've completed 1 puzzles!")).toBeInTheDocument());
		await fireEvent.click(getByText(/Delete my account/i));
		await waitFor(() => expect(mockDeleteUser).toHaveBeenCalledTimes(1));
		expect(mockSignOut).toHaveBeenCalledTimes(1);
		expect(mockGoto).toHaveBeenCalledWith('/login');
	});

	it('redirects to /login when the user is not authenticated', async () => {
		mockGetCurrentUser.mockRejectedValue(new Error('no session'));
		render(Page);
		await waitFor(() => expect(mockGoto).toHaveBeenCalledWith('/login'));
	});
});
