import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { NO_ASSISTS, type ActiveSession } from './helpers/session/puzzleSession';

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

// PuzzleToolbar imports puzzleGameLogic, which pulls in amplify/aws-sdk.
const navigateToHistory = vi.fn();
vi.mock('./helpers/puzzleGameLogic', () => ({
	handleToolbarAction: (fn: () => void) => fn(),
	navigateToHistory: () => navigateToHistory()
}));

import PuzzleCrossword from './PuzzleCrossword.svelte';
import { previewClues } from './preview/previewClues';

const puzzle = { id: 'p-1', clues: previewClues, title: 'T', author: 'A' };
const playing: ActiveSession = {
	phase: 'playing',
	puzzle,
	elapsedSeconds: 65,
	assists: NO_ASSISTS
};
const solved: ActiveSession = { ...playing, phase: 'solved' };

const makeProps = (overrides = {}) => ({
	session: playing,
	showAppKeyboard: false,
	keyboardStyle: 'outline' as const,
	onAssist: vi.fn(),
	onToggleKeyboard: vi.fn(),
	onContinue: vi.fn(),
	...overrides
});

describe('PuzzleCrossword', () => {
	beforeEach(() => vi.clearAllMocks());

	it('mounts the crossword article with the session puzzle and the toolbar timer', () => {
		const { container, getByText } = render(PuzzleCrossword, { props: makeProps() });
		expect(container.querySelector('article.svelte-crossword')).not.toBeNull();
		expect(container.querySelectorAll('svg g.cell').length).toBe(21);
		expect(getByText(/1m\s+5s/)).toBeInTheDocument();
	});

	it('shows History while playing and Continue once solved', async () => {
		const onContinue = vi.fn();
		const { getByText, queryByText, rerender } = render(PuzzleCrossword, {
			props: makeProps({ onContinue })
		});
		expect(getByText('History')).toBeInTheDocument();
		expect(queryByText('Continue')).toBeNull();
		await rerender(makeProps({ session: solved, onContinue }));
		await fireEvent.click(getByText('Continue'));
		expect(onContinue).toHaveBeenCalledOnce();
	});

	it('a solved session opens with every square filled in', () => {
		const { container } = render(PuzzleCrossword, { props: makeProps({ session: solved }) });
		expect(container.querySelectorAll('svg g.cell text.value').length).toBe(21);
	});

	it('passes assists through so toolbar buttons render active', () => {
		const { getByText } = render(PuzzleCrossword, {
			props: makeProps({
				session: { ...playing, assists: { usedClear: true, usedReveal: true, usedCheck: true } }
			})
		});
		expect(getByText('Clear')).toHaveClass('active');
		expect(getByText('Reveal')).toHaveClass('active');
		expect(getByText('Check')).toHaveClass('active');
	});

	it('wires onToggleKeyboard and onAssist through the toolbar', async () => {
		const props = makeProps();
		const { getByTitle, getByText } = render(PuzzleCrossword, { props });
		await fireEvent.click(getByTitle('Toggle keyboard'));
		expect(props.onToggleKeyboard).toHaveBeenCalledOnce();
		await fireEvent.click(getByText('Check'));
		expect(props.onAssist).toHaveBeenCalledWith('check');
	});

	it('Reveal fills the grid through the engine slot callback', async () => {
		const { getByText, container } = render(PuzzleCrossword, { props: makeProps() });
		await fireEvent.click(getByText('Reveal'));
		expect(container.querySelectorAll('svg g.cell text.value').length).toBe(21);
	});
});
