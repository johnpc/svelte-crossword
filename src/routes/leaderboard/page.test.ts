import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';

const mockGetLeaderboard = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockToastPush = vi.fn();

vi.mock('aws-amplify', () => ({ Amplify: { configure: vi.fn() } }));
vi.mock('../../amplify_outputs.json', () => ({ default: { custom: {} } }));
// LeaderboardItem imports getCurrentUser; mock it so its onMount resolves quietly.
vi.mock('aws-amplify/auth', () => ({
	getCurrentUser: () => mockGetCurrentUser()
}));
vi.mock('../helpers/sql/getLeaderboard', () => ({
	getLeaderboard: () => mockGetLeaderboard()
}));
vi.mock('@zerodevx/svelte-toast', () => ({
	SvelteToast: vi.fn(),
	toast: { push: (...a: unknown[]) => mockToastPush(...a) }
}));

import Page from './+page.svelte';

const fixture = {
	total: 42,
	users: [
		{ id: 'u-1', name: 'alice@example.com', email: 'alice@example.com', completedCount: 7 },
		{ id: 'u-2', name: 'bob@example.com', email: 'bob@example.com', completedCount: 3 }
	]
};

describe('leaderboard/+page.svelte', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetCurrentUser.mockResolvedValue({ userId: 'u-1' });
	});

	it('shows the loading spinner before the leaderboard resolves', () => {
		mockGetLeaderboard.mockReturnValue(new Promise(() => {}));
		const { container, queryByText } = render(Page);
		expect(container.querySelector('h1')).toBeInTheDocument();
		expect(queryByText(/Total users/)).toBeNull();
	});

	it('renders one LeaderboardItem row per profile and the total after load', async () => {
		mockGetLeaderboard.mockResolvedValue(fixture);
		const { getByText, container } = render(Page);
		await waitFor(() => expect(getByText('Total users: 42')).toBeInTheDocument());
		expect(getByText(/alice \(7\)/)).toBeInTheDocument();
		expect(getByText(/bob \(3\)/)).toBeInTheDocument();
		expect(container.querySelectorAll('ol > li')).toHaveLength(2);
	});

	it('stops the spinner and pushes a toast when getLeaderboard rejects', async () => {
		mockGetLeaderboard.mockRejectedValue(new Error('boom'));
		const { getByText, container } = render(Page);
		await waitFor(() => expect(mockToastPush).toHaveBeenCalledTimes(1));
		expect(mockToastPush).toHaveBeenCalledWith(
			expect.stringContaining('Could not load the leaderboard')
		);
		// Spinner is gone (isLoading flipped to false) and the list rendered empty.
		expect(getByText('Total users: 0')).toBeInTheDocument();
		expect(container.querySelectorAll('ol > li')).toHaveLength(0);
	});
});
