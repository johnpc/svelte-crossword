import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

// puzzleGameLogic pulls in aws-sdk/amplify, so mock it. handleToolbarAction just
// invokes the supplied callback so our spies fire; navigateToHistory is a spy.
const navigateToHistory = vi.fn();
vi.mock('./helpers/puzzleGameLogic', () => ({
	handleToolbarAction: (fn: () => void) => fn(),
	navigateToHistory: () => navigateToHistory()
}));

import PuzzleToolbar from './PuzzleToolbar.svelte';

const makeProps = (overrides = {}) => ({
	timeInSeconds: 65,
	isPuzzleComplete: false,
	usedClear: false,
	usedReveal: false,
	usedCheck: false,
	showAppKeyboard: false,
	onClear: vi.fn(),
	onReveal: vi.fn(),
	onCheck: vi.fn(),
	onToggleKeyboard: vi.fn(),
	onNextPuzzle: vi.fn(),
	...overrides
});

describe('PuzzleToolbar', () => {
	beforeEach(() => {
		navigateToHistory.mockClear();
	});

	it('renders the human-readable timer', () => {
		const { getByText } = render(PuzzleToolbar, { props: makeProps({ timeInSeconds: 65 }) });
		// 65s -> "1m 5s"
		expect(getByText(/1m\s+5s/)).toBeInTheDocument();
	});

	it('shows the History button (not Continue) when the puzzle is not complete', () => {
		const { getByText, queryByText } = render(PuzzleToolbar, {
			props: makeProps({ isPuzzleComplete: false })
		});
		expect(getByText('History')).toBeInTheDocument();
		expect(queryByText('Continue')).toBeNull();
	});

	it('shows the Continue button (not History) when the puzzle is complete', () => {
		const { getByText, queryByText } = render(PuzzleToolbar, {
			props: makeProps({ isPuzzleComplete: true })
		});
		expect(getByText('Continue')).toBeInTheDocument();
		expect(queryByText('History')).toBeNull();
	});

	it('calls navigateToHistory when the History button is clicked', async () => {
		const { getByText } = render(PuzzleToolbar, { props: makeProps() });
		await fireEvent.click(getByText('History'));
		expect(navigateToHistory).toHaveBeenCalledOnce();
	});

	it('calls onNextPuzzle when the Continue button is clicked', async () => {
		const onNextPuzzle = vi.fn();
		const { getByText } = render(PuzzleToolbar, {
			props: makeProps({ isPuzzleComplete: true, onNextPuzzle })
		});
		await fireEvent.click(getByText('Continue'));
		expect(onNextPuzzle).toHaveBeenCalledOnce();
	});

	it('calls onToggleKeyboard when the keyboard toggle is clicked', async () => {
		const onToggleKeyboard = vi.fn();
		const { getByTitle } = render(PuzzleToolbar, { props: makeProps({ onToggleKeyboard }) });
		await fireEvent.click(getByTitle('Toggle keyboard'));
		expect(onToggleKeyboard).toHaveBeenCalledOnce();
	});

	it('shows the phone glyph when showAppKeyboard is false', () => {
		const { getByTitle } = render(PuzzleToolbar, { props: makeProps({ showAppKeyboard: false }) });
		expect(getByTitle('Toggle keyboard').textContent?.trim()).toBe('📱');
	});

	it('shows the keyboard glyph when showAppKeyboard is true', () => {
		const { getByTitle } = render(PuzzleToolbar, { props: makeProps({ showAppKeyboard: true }) });
		expect(getByTitle('Toggle keyboard').textContent?.trim()).toBe('⌨️');
	});

	it('fires onClear and marks the Clear button active when clicked', async () => {
		const onClear = vi.fn();
		const { getByText } = render(PuzzleToolbar, { props: makeProps({ onClear }) });
		const clear = getByText('Clear');
		expect(clear).not.toHaveClass('active');
		await fireEvent.click(clear);
		expect(onClear).toHaveBeenCalledOnce();
		expect(clear).toHaveClass('active');
	});

	it('fires onReveal and marks the Reveal button active when clicked', async () => {
		const onReveal = vi.fn();
		const { getByText } = render(PuzzleToolbar, { props: makeProps({ onReveal }) });
		const reveal = getByText('Reveal');
		expect(reveal).not.toHaveClass('active');
		await fireEvent.click(reveal);
		expect(onReveal).toHaveBeenCalledOnce();
		expect(reveal).toHaveClass('active');
	});

	it('fires onCheck and marks the Check button active when clicked', async () => {
		const onCheck = vi.fn();
		const { getByText } = render(PuzzleToolbar, { props: makeProps({ onCheck }) });
		const check = getByText('Check');
		expect(check).not.toHaveClass('active');
		await fireEvent.click(check);
		expect(onCheck).toHaveBeenCalledOnce();
		expect(check).toHaveClass('active');
	});

	it('renders Clear/Reveal/Check already active when their used* props are true', () => {
		const { getByText } = render(PuzzleToolbar, {
			props: makeProps({ usedClear: true, usedReveal: true, usedCheck: true })
		});
		expect(getByText('Clear')).toHaveClass('active');
		expect(getByText('Reveal')).toHaveClass('active');
		expect(getByText('Check')).toHaveClass('active');
	});
});
