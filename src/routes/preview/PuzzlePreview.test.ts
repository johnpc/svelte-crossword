import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';

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
const toastPush = vi.fn();
vi.mock('@zerodevx/svelte-toast', () => ({
	SvelteToast: vi.fn(),
	toast: { push: (...a: unknown[]) => toastPush(...a) }
}));
const mockGoto = vi.fn();
vi.mock('$app/navigation', () => ({ goto: (...a: unknown[]) => mockGoto(...a) }));
// PuzzleToolbar pulls puzzleGameLogic (amplify/aws-sdk).
vi.mock('../helpers/puzzleGameLogic', () => ({
	handleToolbarAction: (fn: () => void) => fn(),
	navigateToHistory: vi.fn()
}));
const getCurrentUser = vi.fn();
vi.mock('aws-amplify/auth', () => ({ getCurrentUser: () => getCurrentUser() }));

import PuzzlePreview from './PuzzlePreview.svelte';
import { previewSession, resetPreviewSession, PREVIEW_PUZZLE } from './previewSession';

const SOLUTION = 'TISBOWIESWIMSPAPASEXO';

describe('preview/PuzzlePreview', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getCurrentUser.mockRejectedValue(new Error('not signed in'));
		localStorage.clear();
		resetPreviewSession();
	});

	it('shows the spinner before the sitting starts', () => {
		const { container } = render(PuzzlePreview);
		expect(container.querySelector('article.svelte-crossword')).toBeNull();
		expect(container.querySelector('div[style*="margin"]')).not.toBeNull();
	});

	it('renders the "not signed in" UI, the crossword and the toolbar once loaded', async () => {
		const { container, getByText, queryByText } = render(PuzzlePreview);
		await waitFor(() => expect(getByText("You're not signed in!")).toBeInTheDocument());
		expect(getByText('sign in/up')).toBeInTheDocument();
		expect(container.querySelector('article.svelte-crossword')).not.toBeNull();
		expect(getByText('Clear')).toBeInTheDocument();
		expect(getByText('Reveal')).toBeInTheDocument();
		expect(getByText('Check')).toBeInTheDocument();
		expect(queryByText('History')).toBeNull();
		expect(previewSession.current().phase).toBe('playing');
	});

	it('navigates to /login when the sign in button is clicked', async () => {
		const { getByText } = render(PuzzlePreview);
		await waitFor(() => expect(getByText('sign in/up')).toBeInTheDocument());
		await fireEvent.click(getByText('sign in/up'));
		expect(mockGoto).toHaveBeenCalledWith('/login');
	});

	it('redirects to "/" when getCurrentUser resolves with a user id and never starts', async () => {
		getCurrentUser.mockResolvedValue({ userId: 'u1' });
		render(PuzzlePreview);
		await waitFor(() => expect(mockGoto).toHaveBeenCalledWith('/'));
		expect(previewSession.current().phase).toBe('loading');
	});

	it('solving the grid moves the sitting to solved; Continue shows the sign-up toast', async () => {
		const { container, getByText } = render(PuzzlePreview);
		await waitFor(() => expect(getByText('Check')).toBeInTheDocument());
		await fireEvent.click(container.querySelector('g.cell-0-0')!);
		for (const letter of SOLUTION) {
			await fireEvent.keyDown(container.querySelector('g.cell.is-focused')!, { key: letter });
		}
		await waitFor(() => expect(getByText('Continue')).toBeInTheDocument());
		expect(previewSession.current().phase).toBe('solved');
		await fireEvent.click(getByText('Continue'));
		expect(toastPush).toHaveBeenCalledOnce();
	});

	it('a previously solved preview reopens solved, with the grid filled in', async () => {
		previewSession.send({ type: 'puzzleLoaded', puzzle: PREVIEW_PUZZLE });
		previewSession.send({ type: 'gridSolved' });
		const { container, getByText } = render(PuzzlePreview);
		await waitFor(() => expect(getByText('Continue')).toBeInTheDocument());
		expect(container.querySelectorAll('svg g.cell text.value').length).toBe(21);
	});

	it('an unfinished earlier visit starts over', async () => {
		previewSession.send({ type: 'puzzleLoaded', puzzle: PREVIEW_PUZZLE });
		previewSession.send({ type: 'tick' });
		const { getByText } = render(PuzzlePreview);
		await waitFor(() => expect(getByText('Check')).toBeInTheDocument());
		expect(previewSession.current()).toMatchObject({ phase: 'playing', elapsedSeconds: 0 });
	});
});
