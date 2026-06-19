import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

import PuzzleCells from './PuzzleCells.svelte';
import type { Cell } from './helpers/types';

const makeCells = (): Cell[] => [
	{
		id: '0-0',
		x: 0,
		y: 0,
		index: 0,
		value: '',
		answer: 'C',
		number: 1,
		custom: '',
		clueNumbers: {}
	},
	{
		id: '1-0',
		x: 1,
		y: 0,
		index: 1,
		value: 'A',
		answer: 'A',
		number: 0,
		custom: '',
		clueNumbers: {}
	},
	{
		id: '2-0',
		x: 2,
		y: 0,
		index: 2,
		value: '',
		answer: 'T',
		number: 0,
		custom: '',
		clueNumbers: {}
	}
];

const makeProps = (overrides = {}) => ({
	cells: makeCells(),
	w: 3,
	h: 1,
	focusedCellIndex: 0,
	isDisableHighlight: false,
	isRevealing: false,
	isChecking: false,
	revealDuration: 1000,
	keyboardVisible: true,
	secondarilyFocusedCells: [] as number[],
	act: vi.fn(),
	...overrides
});

describe('PuzzleCells', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders an svg with one <g> cell per cell', () => {
		const { container } = render(PuzzleCells, { props: makeProps() });
		expect(container.querySelector('svg')).toBeInTheDocument();
		expect(container.querySelectorAll('g.cell')).toHaveLength(3);
	});

	it('sets the svg viewBox from w and h', () => {
		const { container } = render(PuzzleCells, { props: makeProps({ w: 3, h: 1 }) });
		expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 3 1');
	});

	it('applies is-focused to only the cell matching focusedCellIndex', () => {
		const { container } = render(PuzzleCells, { props: makeProps({ focusedCellIndex: 1 }) });
		const focused = container.querySelectorAll('g.cell.is-focused');
		expect(focused).toHaveLength(1);
		// index 1 lives at x=1,y=0
		expect(focused[0]).toHaveClass('cell-1-0');
	});

	it('does not highlight the focused cell when isDisableHighlight is true', () => {
		const { container } = render(PuzzleCells, {
			props: makeProps({ focusedCellIndex: 1, isDisableHighlight: true })
		});
		expect(container.querySelectorAll('g.cell.is-focused')).toHaveLength(0);
	});

	it('applies is-secondarily-focused to cells listed in secondarilyFocusedCells', () => {
		const { container } = render(PuzzleCells, {
			props: makeProps({ secondarilyFocusedCells: [0, 2] })
		});
		const secondary = container.querySelectorAll('g.cell.is-secondarily-focused');
		expect(secondary).toHaveLength(2);
	});

	it('suppresses secondary highlight when isDisableHighlight is true', () => {
		const { container } = render(PuzzleCells, {
			props: makeProps({ secondarilyFocusedCells: [0, 2], isDisableHighlight: true })
		});
		expect(container.querySelectorAll('g.cell.is-secondarily-focused')).toHaveLength(0);
	});

	it('dispatches a focusCell action through act when a cell is clicked', async () => {
		const act = vi.fn();
		const { container } = render(PuzzleCells, { props: makeProps({ act }) });
		const cells = container.querySelectorAll('g.cell');
		await fireEvent.click(cells[2]);
		expect(act).toHaveBeenCalledWith({ type: 'focusCell', index: 2 });
	});

	it('dispatches a cellUpdate action through act on a letter keydown', async () => {
		const act = vi.fn();
		const { container } = render(PuzzleCells, { props: makeProps({ act }) });
		const cells = container.querySelectorAll('g.cell');
		await fireEvent.keyDown(cells[0], { key: 'q' });
		expect(act).toHaveBeenCalledWith({
			type: 'cellUpdate',
			index: 0,
			value: 'Q',
			diff: 1,
			doReplace: false
		});
	});

	it('dispatches a delete cellUpdate action through act on Backspace', async () => {
		const act = vi.fn();
		const { container } = render(PuzzleCells, { props: makeProps({ act }) });
		const cells = container.querySelectorAll('g.cell');
		await fireEvent.keyDown(cells[1], { key: 'Backspace' });
		expect(act).toHaveBeenCalledWith({
			type: 'cellUpdate',
			index: 1,
			value: '',
			diff: -1,
			doReplace: true
		});
	});

	it('dispatches a moveFocus action through act on an arrow key', async () => {
		const act = vi.fn();
		const { container } = render(PuzzleCells, { props: makeProps({ act }) });
		const cells = container.querySelectorAll('g.cell');
		await fireEvent.keyDown(cells[0], { key: 'ArrowDown' });
		expect(act).toHaveBeenCalledWith({ type: 'moveFocus', direction: 'down', diff: 1 });
	});

	it('dispatches flipDirection, focusClueDiff and historicalChange actions through act', async () => {
		const act = vi.fn();
		const { container } = render(PuzzleCells, { props: makeProps({ act }) });
		const cell = container.querySelectorAll('g.cell')[0];
		await fireEvent.keyDown(cell, { key: ' ' });
		await fireEvent.keyDown(cell, { key: 'Tab' });
		await fireEvent.keyDown(cell, { key: 'z', ctrlKey: true });
		expect(act).toHaveBeenCalledWith({ type: 'flipDirection' });
		expect(act).toHaveBeenCalledWith({ type: 'focusClueDiff', diff: 1 });
		expect(act).toHaveBeenCalledWith({ type: 'historicalChange', diff: -1 });
	});
});
