import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, fireEvent, screen } from '@testing-library/svelte';

// Crossword engine relies on ResizeObserver, absent in jsdom.
vi.stubGlobal(
	'ResizeObserver',
	class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
);
// jsdom has no Element.scrollTo (the clue list scrolls the focused clue into view).
Element.prototype.scrollTo = () => {};
vi.mock('@capacitor/haptics', () => ({
	Haptics: { impact: vi.fn(), vibrate: vi.fn() },
	ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' }
}));
const mockGoto = vi.fn();
vi.mock('$app/navigation', () => ({ goto: (...a: unknown[]) => mockGoto(...a) }));
vi.mock('aws-amplify/auth', () => ({ getCurrentUser: vi.fn(), signOut: vi.fn() }));
const toastPush = vi.fn();
vi.mock('@zerodevx/svelte-toast', () => ({
	SvelteToast: vi.fn(),
	toast: { push: (...a: unknown[]) => toastPush(...a) }
}));
vi.mock('./helpers/sql/getOrCreateProfile', () => ({ getOrCreateProfile: vi.fn() }));

// puzzleGameLogic pulls amplify/aws-sdk. Mock the whole surface the tree uses.
type Callbacks = {
	onAuthenticated: (p: unknown, puzzle: unknown) => void;
	onUnauthenticated: () => void;
	onError: (e: unknown) => void;
};
let initCallbacks: Callbacks;
const mocks = vi.hoisted(() => ({
	initializePuzzle: vi.fn(),
	loadNextPuzzle: vi.fn(),
	submitPuzzleCompletion: vi.fn(),
	performSignOut: vi.fn(),
	navigateToHistory: vi.fn()
}));
vi.mock('./helpers/puzzleGameLogic', () => ({
	...mocks,
	handleToolbarAction: (fn: () => void) => fn()
}));

import Puzzle from './Puzzle.svelte';
import { previewClues } from './preview/previewClues';

const profile = { id: 'p1', email: 'player@example.com' };
const puzzle = { id: 'puz1', title: 'Monday Mini', author: 'Jane', clues: previewClues };
const SOLUTION = 'TISBOWIESWIMSPAPASEXO';

/** Types a solution the way a solver would: each letter goes to the focused square. */
const solve = async (container: HTMLElement) => {
	await fireEvent.click(container.querySelector('g.cell-0-0')!);
	for (const letter of SOLUTION) {
		const focused = container.querySelector('g.cell.is-focused');
		expect(focused).not.toBeNull();
		await fireEvent.keyDown(focused!, { key: letter });
	}
};

describe('routes/Puzzle', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'error').mockImplementation(() => {});
		localStorage.clear();
		mocks.initializePuzzle.mockImplementation((_u, _p, callbacks: Callbacks) => {
			initCallbacks = callbacks;
		});
	});

	it('shows the spinner while loading and asks puzzleInit to load', () => {
		const { container } = render(Puzzle);
		expect(container.querySelector('article.svelte-crossword')).toBeNull();
		expect(mocks.initializePuzzle).toHaveBeenCalledOnce();
	});

	it('renders header + crossword after authentication', async () => {
		const { container, getByText } = render(Puzzle);
		initCallbacks.onAuthenticated(profile, puzzle);
		await waitFor(() => expect(container.querySelector('article.svelte-crossword')).not.toBeNull());
		expect(getByText(/player/)).toBeInTheDocument();
		expect(getByText('Monday Mini')).toBeInTheDocument();
		expect(getByText('by Jane')).toBeInTheDocument();
	});

	it('shows the exhausted notice when there is no puzzle left', async () => {
		const { getByText } = render(Puzzle);
		initCallbacks.onAuthenticated(profile, null);
		await waitFor(() => expect(getByText(/completed every available puzzle/)).toBeInTheDocument());
	});

	it('shows an error with a retry that loads again', async () => {
		mocks.loadNextPuzzle.mockResolvedValue(puzzle);
		const { getByRole, getByText } = render(Puzzle);
		initCallbacks.onError(new Error('boom'));
		await waitFor(() => expect(getByRole('alert')).toHaveTextContent('Error loading puzzle'));
		expect(toastPush).toHaveBeenCalledWith('Error loading puzzle. Please try refreshing the page.');
		await fireEvent.click(getByText('Try again'));
		await waitFor(() => expect(getByText('Monday Mini')).toBeInTheDocument());
	});

	it('navigates to /preview when unauthenticated', async () => {
		render(Puzzle);
		initCallbacks.onUnauthenticated();
		await waitFor(() => expect(mockGoto).toHaveBeenCalledWith('/preview'));
	});

	it('signs out via the header sign-out link', async () => {
		const { getByText } = render(Puzzle);
		initCallbacks.onAuthenticated(profile, puzzle);
		await waitFor(() => expect(getByText('sign out')).toBeInTheDocument());
		await fireEvent.click(getByText('sign out'));
		expect(mocks.performSignOut).toHaveBeenCalledOnce();
	});

	it('toggles the keyboard preference and persists it', async () => {
		const { getByTitle } = render(Puzzle);
		initCallbacks.onAuthenticated(profile, puzzle);
		await waitFor(() => expect(getByTitle('Toggle keyboard')).toBeInTheDocument());
		await fireEvent.click(getByTitle('Toggle keyboard'));
		expect(localStorage.getItem('showAppKeyboard')).toBe('false');
	});

	it('solving records ONE completion, Continue loads the next puzzle without re-recording', async () => {
		const next = { ...puzzle, id: 'puz2', title: 'Tuesday Mini' };
		mocks.loadNextPuzzle.mockResolvedValue(next);
		const { container, getByText } = render(Puzzle);
		initCallbacks.onAuthenticated(profile, puzzle);
		await waitFor(() => expect(getByText('Check')).toBeInTheDocument());
		await fireEvent.click(getByText('Check'));
		await solve(container);
		await waitFor(() => expect(getByText('Continue')).toBeInTheDocument());
		expect(mocks.submitPuzzleCompletion).toHaveBeenCalledOnce();
		expect(mocks.submitPuzzleCompletion).toHaveBeenCalledWith(
			'p1',
			expect.objectContaining({
				phase: 'solved',
				puzzle,
				assists: { usedCheck: true, usedReveal: false, usedClear: false }
			})
		);
		await fireEvent.click(getByText('Continue'));
		await waitFor(() => expect(getByText('Tuesday Mini')).toBeInTheDocument());
		expect(mocks.loadNextPuzzle).toHaveBeenCalledWith('p1');
		expect(screen.queryByText('Continue')).toBeNull();
		expect(mocks.submitPuzzleCompletion).toHaveBeenCalledOnce();
	});

	it('a failed next-puzzle load shows the error phase with a toast', async () => {
		mocks.loadNextPuzzle.mockRejectedValue(new Error('down'));
		const { container, getByText, getByRole } = render(Puzzle);
		initCallbacks.onAuthenticated(profile, puzzle);
		await waitFor(() => expect(getByText('Check')).toBeInTheDocument());
		await solve(container);
		await fireEvent.click(await screen.findByText('Continue'));
		await waitFor(() => expect(getByRole('alert')).toHaveTextContent('Error loading the next'));
		expect(toastPush).toHaveBeenCalledWith('Error loading the next puzzle. Please try again.');
	});
});
