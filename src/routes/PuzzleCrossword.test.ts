import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

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

// PuzzleToolbar (rendered real via the slot) imports puzzleGameLogic, which pulls
// in amplify/aws-sdk. Mock it: handleToolbarAction just runs its callback.
const navigateToHistory = vi.fn();
vi.mock('./helpers/puzzleGameLogic', () => ({
	handleToolbarAction: (fn: () => void) => fn(),
	navigateToHistory: () => navigateToHistory()
}));

import PuzzleCrossword from './PuzzleCrossword.svelte';
import { previewClues } from './preview/previewClues';

const makeProps = (overrides = {}) => ({
	clues: previewClues,
	showAppKeyboard: false,
	keyboardStyle: 'outline' as const,
	timeInSeconds: 65,
	isPuzzleComplete: false,
	usedClear: false,
	usedReveal: false,
	usedCheck: false,
	onToggleKeyboard: vi.fn(),
	onNextPuzzle: vi.fn(),
	isComplete: false,
	...overrides
});

describe('PuzzleCrossword', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('mounts the crossword article with the supplied clues', () => {
		const { container } = render(PuzzleCrossword, { props: makeProps() });
		expect(container.querySelector('article.svelte-crossword')).not.toBeNull();
		expect(container.querySelector('svg')).not.toBeNull();
	});

	it('renders the PuzzleToolbar via the toolbar slot with the timer', () => {
		const { getByText } = render(PuzzleCrossword, { props: makeProps({ timeInSeconds: 65 }) });
		// 65s -> "1m 5s"
		expect(getByText(/1m\s+5s/)).toBeInTheDocument();
	});

	it('renders the Clear/Reveal/Check toolbar actions', () => {
		const { getByText } = render(PuzzleCrossword, { props: makeProps() });
		expect(getByText('Clear')).toBeInTheDocument();
		expect(getByText('Reveal')).toBeInTheDocument();
		expect(getByText('Check')).toBeInTheDocument();
	});

	it('passes used* props through so toolbar buttons render active', () => {
		const { getByText } = render(PuzzleCrossword, {
			props: makeProps({ usedClear: true, usedReveal: true, usedCheck: true })
		});
		expect(getByText('Clear')).toHaveClass('active');
		expect(getByText('Reveal')).toHaveClass('active');
		expect(getByText('Check')).toHaveClass('active');
	});

	it('shows History (not Continue) while the puzzle is not complete', () => {
		const { getByText, queryByText } = render(PuzzleCrossword, {
			props: makeProps({ isPuzzleComplete: false })
		});
		expect(getByText('History')).toBeInTheDocument();
		expect(queryByText('Continue')).toBeNull();
	});

	it('wires onNextPuzzle through to the Continue button when complete', async () => {
		const onNextPuzzle = vi.fn();
		const { getByText } = render(PuzzleCrossword, {
			props: makeProps({ isPuzzleComplete: true, onNextPuzzle })
		});
		await fireEvent.click(getByText('Continue'));
		expect(onNextPuzzle).toHaveBeenCalledOnce();
	});

	it('wires onToggleKeyboard through to the toolbar toggle', async () => {
		const onToggleKeyboard = vi.fn();
		const { getByTitle } = render(PuzzleCrossword, { props: makeProps({ onToggleKeyboard }) });
		await fireEvent.click(getByTitle('Toggle keyboard'));
		expect(onToggleKeyboard).toHaveBeenCalledOnce();
	});

	it('clicking a toolbar action (Clear) drives the engine via the slot callback', async () => {
		const { getByText, container } = render(PuzzleCrossword, { props: makeProps() });
		await fireEvent.click(getByText('Clear'));
		// engine still mounted after the slot onClear callback ran.
		expect(container.querySelector('article.svelte-crossword')).not.toBeNull();
	});
});
