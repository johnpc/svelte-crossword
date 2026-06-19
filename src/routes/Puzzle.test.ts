import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/svelte';

// Crossword engine relies on ResizeObserver, absent in jsdom.
vi.stubGlobal(
	'ResizeObserver',
	class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
);

// haptics pulls in @capacitor/haptics (native); stub for engine descendants.
vi.mock('@capacitor/haptics', () => ({
	Haptics: { impact: vi.fn(), vibrate: vi.fn() },
	ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' }
}));

// $app/navigation
const mockGoto = vi.fn();
vi.mock('$app/navigation', () => ({ goto: (...a: unknown[]) => mockGoto(...a) }));

// auth (component imports getCurrentUser/signOut but passes them to mocked helpers)
vi.mock('aws-amplify/auth', () => ({
	getCurrentUser: vi.fn(),
	signOut: vi.fn()
}));

// svelte-toast: stub the component, spy push.
const toastPush = vi.fn();
vi.mock('@zerodevx/svelte-toast', () => ({
	SvelteToast: vi.fn(),
	toast: { push: (...a: unknown[]) => toastPush(...a) }
}));

// getOrCreateProfile pulls amplify/aws-sdk.
vi.mock('./helpers/sql/getOrCreateProfile', () => ({
	getOrCreateProfile: vi.fn()
}));

// puzzleGameLogic pulls amplify/aws-sdk. Mock the whole surface the component uses.
let initCallbacks: {
	onAuthenticated: (p: unknown, puzzle: unknown) => void;
	onUnauthenticated: () => void;
	onError: (e: unknown) => void;
};
const initializePuzzle = vi.fn(
	(_getUser: unknown, _getProfile: unknown, callbacks: typeof initCallbacks) => {
		initCallbacks = callbacks;
	}
);
const createTimer = vi.fn(() => vi.fn());
const loadNextPuzzle = vi.fn();
const submitPuzzleCompletion = vi.fn();
const performSignOut = vi.fn();
vi.mock('./helpers/puzzleGameLogic', () => ({
	initializePuzzle: (...a: unknown[]) => (initializePuzzle as (...x: unknown[]) => unknown)(...a),
	loadNextPuzzle: (...a: unknown[]) => (loadNextPuzzle as (...x: unknown[]) => unknown)(...a),
	submitPuzzleCompletion: (...a: unknown[]) =>
		(submitPuzzleCompletion as (...x: unknown[]) => unknown)(...a),
	createTimer: (...a: unknown[]) => (createTimer as (...x: unknown[]) => unknown)(...a),
	performSignOut: (...a: unknown[]) => (performSignOut as (...x: unknown[]) => unknown)(...a)
}));

import Puzzle from './Puzzle.svelte';
import { previewClues } from './preview/previewClues';

const profile = { id: 'p1', email: 'player@example.com' };
const puzzle = {
	id: 'puz1',
	title: 'Monday Mini',
	author: 'Jane',
	clues: previewClues
};

describe('routes/Puzzle', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	it('shows the SyncLoader spinner while clues are empty', () => {
		const { container } = render(Puzzle);
		// SyncLoader renders a wrapping element; the grid article must NOT be present yet.
		expect(container.querySelector('article.svelte-crossword')).toBeNull();
		expect(container.querySelector('p')).not.toBeNull();
	});

	it('calls initializePuzzle on mount', () => {
		render(Puzzle);
		expect(initializePuzzle).toHaveBeenCalledOnce();
	});

	it('renders PuzzleHeader + PuzzleCrossword after onAuthenticated fires', async () => {
		const { container, getByText } = render(Puzzle);
		// drive the auth callback the component passed into initializePuzzle
		initCallbacks.onAuthenticated(profile, puzzle);
		await waitFor(() => {
			expect(container.querySelector('article.svelte-crossword')).not.toBeNull();
		});
		// header greets the user and shows title/author
		expect(getByText(/player/)).toBeInTheDocument();
		expect(getByText('Monday Mini')).toBeInTheDocument();
		expect(getByText('by Jane')).toBeInTheDocument();
	});

	it('pushes a toast when onError fires', async () => {
		render(Puzzle);
		initCallbacks.onError(new Error('boom'));
		await waitFor(() => {
			expect(toastPush).toHaveBeenCalledOnce();
		});
		expect(toastPush).toHaveBeenCalledWith('Error loading puzzle. Please try refreshing the page.');
	});

	it('navigates to /preview when unauthenticated', async () => {
		render(Puzzle);
		initCallbacks.onUnauthenticated();
		await waitFor(() => {
			expect(mockGoto).toHaveBeenCalledWith('/preview');
		});
	});

	it('starts the timer', () => {
		render(Puzzle);
		expect(createTimer).toHaveBeenCalled();
	});

	it('signs out via the header sign-out link', async () => {
		const { getByText } = render(Puzzle);
		initCallbacks.onAuthenticated(profile, puzzle);
		await waitFor(() => expect(getByText('sign out')).toBeInTheDocument());
		await fireEvent.click(getByText('sign out'));
		expect(performSignOut).toHaveBeenCalledOnce();
	});

	it('toggles the keyboard preference and persists it', async () => {
		const { getByTitle } = render(Puzzle);
		initCallbacks.onAuthenticated(profile, puzzle);
		await waitFor(() => expect(getByTitle('Toggle keyboard')).toBeInTheDocument());
		await fireEvent.click(getByTitle('Toggle keyboard'));
		expect(localStorage.getItem('showAppKeyboard')).toBe('false');
	});

	// Note: the "Continue"/next-puzzle and completion-submit paths only appear
	// after a full solve (driven by the bind:isComplete from the engine). Those
	// are exercised end-to-end by the Playwright preview-solve suite rather than
	// here, where forcing engine completion in jsdom is not meaningful.
});
