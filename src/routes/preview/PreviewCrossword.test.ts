import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { NO_ASSISTS, type ActiveSession } from '../helpers/session/puzzleSession';

vi.stubGlobal(
	'ResizeObserver',
	class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
);
vi.mock('@capacitor/haptics', () => ({
	Haptics: { impact: vi.fn(), vibrate: vi.fn() },
	ImpactStyle: { Medium: 'MEDIUM' }
}));
vi.mock('../helpers/puzzleGameLogic', () => ({
	handleToolbarAction: (fn: () => void) => fn(),
	navigateToHistory: vi.fn()
}));

import PreviewCrossword from './PreviewCrossword.svelte';
import { previewClues } from './previewClues';

const playing: ActiveSession = {
	phase: 'playing',
	puzzle: { id: 'preview', clues: previewClues },
	elapsedSeconds: 65,
	assists: NO_ASSISTS
};

const makeProps = (overrides = {}) => ({
	session: playing,
	showAppKeyboard: false,
	keyboardStyle: 'outline' as const,
	onAssist: vi.fn(),
	onToggleKeyboard: vi.fn(),
	onContinue: vi.fn(),
	...overrides
});

describe('PreviewCrossword', () => {
	beforeEach(() => vi.clearAllMocks());

	it('renders the grid and the toolbar without a History button', () => {
		const { container, getByText, queryByText } = render(PreviewCrossword, {
			props: makeProps()
		});
		expect(container.querySelector('article.svelte-crossword')).not.toBeNull();
		expect(getByText(/1m\s+5s/)).toBeInTheDocument();
		expect(getByText('Clear')).toBeInTheDocument();
		expect(queryByText('History')).toBeNull();
		expect(queryByText('Continue')).toBeNull();
	});

	it('forwards toolbar interactions', async () => {
		const props = makeProps();
		const { getByText, getByTitle } = render(PreviewCrossword, { props });
		await fireEvent.click(getByTitle('Toggle keyboard'));
		expect(props.onToggleKeyboard).toHaveBeenCalledOnce();
		await fireEvent.click(getByText('Reveal'));
		expect(props.onAssist).toHaveBeenCalledWith('reveal');
	});

	it('shows Continue once solved and fires onContinue', async () => {
		const onContinue = vi.fn();
		const { getByText } = render(PreviewCrossword, {
			props: makeProps({ session: { ...playing, phase: 'solved' }, onContinue })
		});
		await fireEvent.click(getByText('Continue'));
		expect(onContinue).toHaveBeenCalledOnce();
	});
});
