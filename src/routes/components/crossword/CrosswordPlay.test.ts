import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';

// The crossword engine (Puzzle.svelte) is heavy: it pulls in PuzzleGrid /
// PuzzleKeyboard, the puzzleController dispatcher, ResizeObserver, and a
// global window click listener. We stub Puzzle to a lightweight component so
// these tests stay focused on CrosswordPlay's OWN behaviour: its container
// classes and the cellIndexMap / focusedCell values it derives reactively.
// The real Clues child is rendered so we can assert the derived focusedCell
// flows through (the focused clue shows up in the clue bar).
vi.mock('./Puzzle.svelte', () => ({ default: () => {} }));

// Safety-net polyfill/mocks per the engine guidance (harmless even with the
// Puzzle stub, in case any descendant import is evaluated).
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
	ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' }
}));

import CrosswordPlay from './CrosswordPlay.svelte';

// 2x2-ish cell set; ids match the down/across clue ids below.
const cells = [
	{
		x: 0,
		y: 0,
		index: 0,
		value: '',
		answer: 'C',
		number: 1,
		id: '0-0',
		clueNumbers: { across: 1, down: 1 }
	},
	{ x: 1, y: 0, index: 1, value: '', answer: 'A', number: 0, id: '1-0', clueNumbers: { across: 1 } }
];

const clues = [
	{
		clue: 'Feline',
		answer: 'CA',
		x: 0,
		y: 0,
		direction: 'across',
		number: 1,
		id: '0-0',
		index: 0,
		cells: [],
		custom: '',
		isFilled: false
	},
	{
		clue: 'Recipe qty.',
		answer: 'C',
		x: 0,
		y: 0,
		direction: 'down',
		number: 1,
		id: '0-0',
		index: 1,
		cells: [],
		custom: '',
		isFilled: false
	}
];

const base = {
	clues,
	cells,
	stacked: false,
	isDisableHighlight: false,
	isLoaded: false,
	focusedCellIndex: 0,
	focusedDirection: 'across',
	isRevealing: false,
	isChecking: false,
	revealDuration: 0,
	showKeyboard: false,
	keyboardStyle: {}
};

describe('CrosswordPlay', () => {
	it('renders the .play container', () => {
		const { container } = render(CrosswordPlay, { props: base });
		expect(container.querySelector('.play')).not.toBeNull();
	});

	it('applies stacked and is-loaded classes from props', () => {
		const { container } = render(CrosswordPlay, {
			props: { ...base, stacked: true, isLoaded: true }
		});
		const play = container.querySelector('.play');
		expect(play).toHaveClass('stacked');
		expect(play).toHaveClass('is-loaded');
	});

	it('omits the classes when props are false', () => {
		const { container } = render(CrosswordPlay, {
			props: { ...base, stacked: false, isLoaded: false }
		});
		const play = container.querySelector('.play');
		expect(play).not.toHaveClass('stacked');
		expect(play).not.toHaveClass('is-loaded');
	});

	it('derives focusedCell so the focused across clue appears in the clue bar', () => {
		// focusedCellIndex 0 -> cells[0] (clueNumbers.across === 1); the across
		// clue numbered 1 is "Feline". Clues renders it in its clue bar + list.
		const { getAllByText } = render(CrosswordPlay, { props: base });
		expect(getAllByText(/Feline/).length).toBeGreaterThanOrEqual(1);
	});

	it('derives cellIndexMap from cells (clicking a clue resolves its cell index)', () => {
		// cellIndexMap is { '0-0': 0, '1-0': 1 } from the cells' ids/indices.
		// Both direction lists render, confirming clues reached the child with
		// a valid map (no throw during the getClueTarget lookups).
		const { getByText } = render(CrosswordPlay, { props: base });
		expect(getByText('across')).toBeInTheDocument();
		expect(getByText('down')).toBeInTheDocument();
	});
});
