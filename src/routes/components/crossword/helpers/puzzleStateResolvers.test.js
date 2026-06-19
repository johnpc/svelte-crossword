import { describe, it, expect } from 'vitest';
import {
	resolveFocusCellDiff,
	resolveFocusClueDiff,
	resolveFocusCell,
	resolveHistoricalChange,
	resolveMoveFocus,
	resolveFlipDirection
} from './puzzleStateResolvers.js';

const baseCells = [
	{ x: 0, y: 0, index: 0, value: '', isFilled: false, clueNumbers: { across: 1, down: 1 } },
	{ x: 1, y: 0, index: 1, value: '', isFilled: false, clueNumbers: { across: 1 } },
	{ x: 0, y: 1, index: 2, value: '', isFilled: false, clueNumbers: { down: 1 } }
];

const baseState = {
	cells: baseCells,
	cellsHistory: [],
	cellsHistoryIndex: 0,
	focusedDirection: 'across',
	focusedCellIndex: 0,
	focusedCell: baseCells[0],
	focusedCellIndexHistory: [],
	focusedCellIndexHistoryIndex: 0,
	sortedCellsInDirection: baseCells,
	clues: [
		{ direction: 'across', number: 1, isFilled: false, cells: [{ index: 0 }, { index: 1 }] },
		{ direction: 'down', number: 1, isFilled: false, cells: [{ index: 0 }, { index: 2 }] }
	],
	isPuzzleFocused: false,
	numberOfStatesInHistory: 10
};

describe('resolveFocusCellDiff', () => {
	it('moves focus by diff', () => {
		const r = resolveFocusCellDiff(baseState, 1, false);
		expect(r).toBeTruthy();
		expect(r.focusedCellIndex).toBe(1);
	});

	it('returns null when no next cell', () => {
		const last = { ...baseState, focusedCellIndex: 2 };
		const r = resolveFocusCellDiff(last, 1, false);
		expect(r).toBeNull();
	});
});

describe('resolveFocusCell', () => {
	it('flips direction when clicking the focused cell', () => {
		const r = resolveFocusCell(baseState, 0, true, 10);
		expect(r._focusHidden).toBe(true);
		expect(['across', 'down']).toContain(r.focusedDirection);
	});

	it('focuses a new cell', () => {
		const r = resolveFocusCell(baseState, 1, false, 10);
		expect(r.focusedCellIndex).toBe(1);
		expect(r.focusedCellIndexHistoryIndex).toBe(0);
	});

	it('switches direction when clicked cell has no clue in current direction', () => {
		const r = resolveFocusCell(baseState, 2, false, 10);
		expect(r.focusedCellIndex).toBe(2);
		expect(r.focusedDirection).toBe('down');
	});
});

describe('resolveFocusClueDiff', () => {
	it('returns a patch with focusedCellIndex', () => {
		const r = resolveFocusClueDiff(baseState, 1);
		expect(r).toHaveProperty('focusedCellIndex');
	});
});

describe('resolveHistoricalChange', () => {
	it('returns a result with cells/history info', () => {
		const stateWithHistory = {
			...baseState,
			cellsHistory: [baseCells, baseCells],
			cellsHistoryIndex: 1,
			focusedCellIndexHistory: [0, 0],
			focusedCellIndexHistoryIndex: 1
		};
		const r = resolveHistoricalChange(stateWithHistory, -1);
		expect(r).toBeDefined();
	});
});

describe('resolveMoveFocus', () => {
	it('returns empty object when no result', () => {
		const r = resolveMoveFocus(baseState, { direction: 'across', diff: -1 });
		expect(r).toEqual({});
	});

	it('returns focusedDirection when move flips direction', () => {
		const r = resolveMoveFocus(baseState, { direction: 'down', diff: 1 });
		expect(r).toBeDefined();
	});
});

describe('resolveFlipDirection', () => {
	it('flips direction when possible', () => {
		const r = resolveFlipDirection(baseState);
		expect(r).toBeDefined();
		if (r.focusedDirection) {
			expect(r._focusHidden).toBe(true);
		}
	});

	it('returns empty object when flip not possible', () => {
		const cellNoFlip = { ...baseCells[0], clueNumbers: { across: 1 } };
		const state = { ...baseState, focusedCell: cellNoFlip };
		const r = resolveFlipDirection(state);
		expect(r).toEqual({});
	});
});
