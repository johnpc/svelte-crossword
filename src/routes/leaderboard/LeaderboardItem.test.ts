import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';

const mockGetCurrentUser = vi.fn();
vi.mock('aws-amplify', () => ({ Amplify: { configure: vi.fn() } }));
vi.mock('../../amplify_outputs.json', () => ({ default: { custom: {} } }));
vi.mock('aws-amplify/auth', () => ({
	getCurrentUser: () => mockGetCurrentUser()
}));

import LeaderboardItem from './LeaderboardItem.svelte';

const profile = {
	id: 'user-1',
	name: 'jane@example.com',
	email: 'jane@example.com',
	completedCount: 9
};

describe('LeaderboardItem', () => {
	beforeEach(() => vi.clearAllMocks());

	it('renders the name local-part and completed count', () => {
		mockGetCurrentUser.mockRejectedValue(new Error('logged out'));
		const { getByText } = render(LeaderboardItem, { props: { profile } });
		expect(getByText(/jane \(9\)/)).toBeInTheDocument();
	});

	it('highlights the row belonging to the current user', async () => {
		mockGetCurrentUser.mockResolvedValue({ userId: 'user-1' });
		const { container } = render(LeaderboardItem, { props: { profile } });
		await waitFor(() => expect(container.querySelector('li')).toHaveClass('loggedInProfile'));
	});

	it('does not highlight other users rows', async () => {
		mockGetCurrentUser.mockResolvedValue({ userId: 'someone-else' });
		const { container } = render(LeaderboardItem, { props: { profile } });
		await waitFor(() => expect(mockGetCurrentUser).toHaveBeenCalled());
		expect(container.querySelector('li')).not.toHaveClass('loggedInProfile');
	});
});
