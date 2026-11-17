import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { NO_ASSISTS } from './helpers/session/puzzleSession';

// puzzleGameLogic pulls in aws-sdk/amplify, so mock it. handleToolbarAction just
// invokes the supplied callback so our spies fire; navigateToHistory is a spy.
const navigateToHistory = vi.fn();
vi.mock('./helpers/puzzleGameLogic', () => ({
	handleToolbarAction: (fn: () => void) => fn(),
	navigateToHistory: () => navigateToHistory()
}));

import PuzzleToolbar from './PuzzleToolbar.svelte';

const makeProps = (overrides = {}) => ({
	elapsedSeconds: 65,
	solved: false,
	assists: NO_ASSISTS,
	showAppKeyboard: false,
	onClear: vi.fn(),
	onReveal: vi.fn(),
	onCheck: vi.fn(),
	onAssist: vi.fn(),
	onToggleKeyboard: vi.fn(),
	onContinue: vi.fn(),
	...overrides
});

describe('PuzzleToolbar', () => {
	beforeEach(() => navigateToHistory.mockClear());

	it('renders the human-readable timer', () => {
		const { getByText } = render(PuzzleToolbar, { props: makeProps({ elapsedSeconds: 65 }) });
		expect(getByText(/1m\s+5s/)).toBeInTheDocument();
	});

	it('shows History (not Continue) while playing', () => {
		const { getByText, queryByText } = render(PuzzleToolbar, { props: makeProps() });
		expect(getByText('History')).toBeInTheDocument();
		expect(queryByText('Continue')).toBeNull();
	});

	it('shows Continue (not History) once solved', () => {
		const { getByText, queryByText } = render(PuzzleToolbar, {
			props: makeProps({ solved: true })
		});
		expect(getByText('Continue')).toBeInTheDocument();
		expect(queryByText('History')).toBeNull();
	});

	it('can hide the History button (preview mode)', () => {
		const { queryByText } = render(PuzzleToolbar, { props: makeProps({ showHistory: false }) });
		expect(queryByText('History')).toBeNull();
	});

	it('navigates to history and fires onContinue', async () => {
		const onContinue = vi.fn();
		const { getByText, rerender } = render(PuzzleToolbar, { props: makeProps({ onContinue }) });
		await fireEvent.click(getByText('History'));
		expect(navigateToHistory).toHaveBeenCalledOnce();
		await rerender(makeProps({ solved: true, onContinue }));
		await fireEvent.click(getByText('Continue'));
		expect(onContinue).toHaveBeenCalledOnce();
	});

	it('toggles the keyboard and shows the matching glyph', async () => {
		const onToggleKeyboard = vi.fn();
		const { getByTitle, rerender } = render(PuzzleToolbar, {
			props: makeProps({ onToggleKeyboard, showAppKeyboard: false })
		});
		expect(getByTitle('Toggle keyboard').textContent?.trim()).toBe('📱');
		await fireEvent.click(getByTitle('Toggle keyboard'));
		expect(onToggleKeyboard).toHaveBeenCalledOnce();
		await rerender(makeProps({ showAppKeyboard: true }));
		expect(getByTitle('Toggle keyboard').textContent?.trim()).toBe('⌨️');
	});

	it.each([
		['Clear', 'clear', 'onClear'],
		['Reveal', 'reveal', 'onReveal'],
		['Check', 'check', 'onCheck']
	] as const)('%s reports the assist and runs the engine action', async (label, kind, cb) => {
		const props = makeProps();
		const { getByText } = render(PuzzleToolbar, { props });
		await fireEvent.click(getByText(label));
		expect(props.onAssist).toHaveBeenCalledWith(kind);
		expect(props[cb]).toHaveBeenCalledOnce();
	});

	it('highlights the assists the session has recorded', () => {
		const { getByText } = render(PuzzleToolbar, {
			props: makeProps({ assists: { usedClear: true, usedReveal: false, usedCheck: true } })
		});
		expect(getByText('Clear')).toHaveClass('active');
		expect(getByText('Reveal')).not.toHaveClass('active');
		expect(getByText('Check')).toHaveClass('active');
	});
});
