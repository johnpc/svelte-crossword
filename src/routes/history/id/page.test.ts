import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import { readable } from 'svelte/store';

const mockGoto = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockFetchPuzzleById = vi.fn();

vi.mock('aws-amplify', () => ({ Amplify: { configure: vi.fn() } }));
vi.mock('../../../amplify_outputs.json', () => ({ default: { custom: {} } }));
vi.mock('$app/navigation', () => ({ goto: (...a: unknown[]) => mockGoto(...a) }));
vi.mock('$app/stores', () => ({
	page: readable({ url: new URL('http://localhost/history/id?id=up-1') })
}));
vi.mock('aws-amplify/auth', () => ({
	getCurrentUser: () => mockGetCurrentUser()
}));
vi.mock('./fetchPuzzleById', () => ({
	fetchPuzzleById: (id: string) => mockFetchPuzzleById(id)
}));
// The Crossword engine is heavy + needs ResizeObserver; swap it for a stub
// that still renders the `toolbar` slot so the page's toolbar markup is testable.
vi.mock('../../components/crossword/Crossword.svelte', async () => ({
	default: (await import('./__fixtures__/CrosswordStub.svelte')).default
}));

import Page from './+page.svelte';

const clues = [
	{
		clue: 'A clue',
		answer: 'CAT',
		x: 0,
		y: 0,
		direction: 'across',
		number: 1,
		cells: [],
		custom: {},
		isFilled: false
	}
];

describe('history/id/+page.svelte', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetCurrentUser.mockResolvedValue({ userId: 'u-1' });
	});

	it('shows the loading spinner before the puzzle resolves', () => {
		mockFetchPuzzleById.mockReturnValue(new Promise(() => {}));
		const { container } = render(Page);
		expect(container.querySelector('p')).toBeTruthy();
		expect(container.textContent).not.toContain('Solved in');
	});

	it('renders the solved time and the used badges after data loads', async () => {
		mockFetchPuzzleById.mockResolvedValue({
			userPuzzle: {
				time_in_seconds: 65,
				used_check: 1,
				used_clear: 1,
				used_reveal: 0,
				puzzle_id: 'puz-1'
			},
			clues
		});
		const { getByText, queryByText } = render(Page);
		await waitFor(() => expect(getByText(/Solved in/)).toBeInTheDocument());
		expect(getByText(/Solved in 1m 5s seconds\./)).toBeInTheDocument();
		expect(getByText(/Used Clear/)).toBeInTheDocument();
		expect(getByText(/Used Check/)).toBeInTheDocument();
		// used_reveal is 0, so the reveal badge must not show.
		expect(queryByText(/Used Reveal/)).toBeNull();
	});

	it('passes the id from the query string to fetchPuzzleById', async () => {
		mockFetchPuzzleById.mockResolvedValue({
			userPuzzle: {
				time_in_seconds: 10,
				used_check: 0,
				used_clear: 0,
				used_reveal: 0,
				puzzle_id: 'puz-1'
			},
			clues
		});
		render(Page);
		await waitFor(() => expect(mockFetchPuzzleById).toHaveBeenCalledWith('up-1'));
	});

	it('redirects to /login when the user is not authenticated', async () => {
		mockGetCurrentUser.mockRejectedValue(new Error('no session'));
		render(Page);
		await waitFor(() => expect(mockGoto).toHaveBeenCalledWith('/login'));
		expect(mockFetchPuzzleById).not.toHaveBeenCalled();
	});
});
