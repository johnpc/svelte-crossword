import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

// Crossword engine relies on ResizeObserver (PuzzleGrid descendants), absent in jsdom.
vi.stubGlobal(
	'ResizeObserver',
	class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
);

// haptics pulls in @capacitor/haptics (native); stub so the keyboard/controller mount.
vi.mock('@capacitor/haptics', () => ({
	Haptics: { impact: vi.fn(), vibrate: vi.fn() },
	ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' }
}));

import Puzzle from './Puzzle.svelte';
import type { Cell, Clue, Direction } from './helpers/types';

// 2x1 grid; ids/clueNumbers match the across clue below.
const cells: Cell[] = [
	{
		x: 0,
		y: 0,
		index: 0,
		value: '',
		answer: 'C',
		number: 1,
		custom: '',
		id: '0-0',
		clueNumbers: { across: 1 }
	},
	{
		x: 1,
		y: 0,
		index: 1,
		value: '',
		answer: 'A',
		number: 0,
		custom: '',
		id: '1-0',
		clueNumbers: { across: 1 }
	}
];

const clues: Clue[] = [
	{
		clue: 'Feline',
		answer: 'CA',
		x: 0,
		y: 0,
		direction: 'across',
		number: 1,
		id: '0-0',
		index: 0,
		cells: [cells[0], cells[1]],
		custom: '',
		isFilled: false
	}
];

const makeProps = (overrides = {}) => ({
	clues,
	cells,
	focusedDirection: 'across' as Direction,
	focusedCellIndex: 0,
	focusedCell: cells[0],
	isRevealing: false,
	isChecking: false,
	isDisableHighlight: false,
	stacked: false,
	revealDuration: 0,
	showKeyboard: false,
	isLoaded: true,
	keyboardStyle: 'outline',
	...overrides
});

describe('Puzzle (engine composer)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the grid (one svg <g> per cell)', () => {
		const { container } = render(Puzzle, { props: makeProps() });
		expect(container.querySelectorAll('g.cell')).toHaveLength(cells.length);
	});

	it('uses a hidden input when showKeyboard is false', () => {
		const { container } = render(Puzzle, { props: makeProps({ showKeyboard: false }) });
		const input = container.querySelector('input[type="text"]');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('aria-hidden', 'true');
	});

	it('renders the on-screen keyboard (no hidden input) when showKeyboard is true', () => {
		const { container } = render(Puzzle, { props: makeProps({ showKeyboard: true }) });
		expect(container.querySelector('input[type="text"]')).toBeNull();
		// PuzzleKeyboard renders letter keys; "A" is present.
		expect(container.textContent).toContain('A');
	});

	it('routes a native keydown through the controller and writes into the focused cell', async () => {
		const { container } = render(Puzzle, { props: makeProps({ showKeyboard: false }) });
		const input = container.querySelector('input[type="text"]')!;
		await fireEvent.keyDown(input, { key: 'c' });
		// dispatch -> handleCellUpdate fills cell 0 with the uppercased letter,
		// which CellText renders inside the grid.
		expect(container.textContent).toContain('C');
	});

	it('renders the on-screen keyboard keys and accepts a key press without throwing', async () => {
		const { container, getByText } = render(Puzzle, { props: makeProps({ showKeyboard: true }) });
		const keyA = getByText('A');
		await fireEvent.click(keyA);
		// after the keyboard dispatches a keydown, the grid still renders.
		expect(container.querySelectorAll('g.cell')).toHaveLength(cells.length);
	});

	it('passes stacked through to the grid section', () => {
		const { container } = render(Puzzle, { props: makeProps({ stacked: true }) });
		expect(container.querySelector('section.puzzle')).toHaveClass('stacked');
	});
});
