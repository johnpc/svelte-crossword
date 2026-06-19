import { describe, it, expect } from 'vitest';
import {
	getNextCellInDirection,
	getNextClueCell,
	getMoveFocusResult,
	getFlippedDirection
} from './puzzleNavigation.js';

describe('getNextCellInDirection', () => {
	const sorted = [
		{ index: 0, value: '' },
		{ index: 1, value: 'A' },
		{ index: 2, value: '' },
		{ index: 3, value: '' }
	];

	it('returns next cell index moving forward', () => {
		const result = getNextCellInDirection({
			sortedCellsInDirection: sorted,
			focusedCellIndex: 1,
			diff: 1,
			doReplaceFilledCells: true
		});
		expect(result).toBe(2);
	});

	it('returns previous cell index moving backward', () => {
		const result = getNextCellInDirection({
			sortedCellsInDirection: sorted,
			focusedCellIndex: 2,
			diff: -1,
			doReplaceFilledCells: true
		});
		expect(result).toBe(1);
	});

	it('skips filled cells when doReplaceFilledCells is false', () => {
		const result = getNextCellInDirection({
			sortedCellsInDirection: sorted,
			focusedCellIndex: 0,
			diff: 1,
			doReplaceFilledCells: false
		});
		expect(result).toBe(2);
	});

	it('returns null when no next cell exists', () => {
		const result = getNextCellInDirection({
			sortedCellsInDirection: sorted,
			focusedCellIndex: 3,
			diff: 1,
			doReplaceFilledCells: true
		});
		expect(result).toBeNull();
	});
});

describe('getFlippedDirection', () => {
	it('flips from across to down when clue exists', () => {
		const result = getFlippedDirection({
			focusedDirection: 'across',
			focusedCell: { clueNumbers: { across: 1, down: 2 } }
		});
		expect(result).toBe('down');
	});

	it('flips from down to across when clue exists', () => {
		const result = getFlippedDirection({
			focusedDirection: 'down',
			focusedCell: { clueNumbers: { across: 1, down: 2 } }
		});
		expect(result).toBe('across');
	});

	it('returns null when no clue in other direction', () => {
		const result = getFlippedDirection({
			focusedDirection: 'across',
			focusedCell: { clueNumbers: { across: 1, down: undefined } }
		});
		expect(result).toBeNull();
	});
});

describe('getNextClueCell', () => {
	const cells = [
		{ index: 0, value: '', clueNumbers: { across: 1, down: 1 } },
		{ index: 1, value: 'A', clueNumbers: { across: 1, down: null } },
		{ index: 2, value: '', clueNumbers: { across: 2, down: null } },
		{ index: 3, value: 'B', clueNumbers: { across: 2, down: null } }
	];
	const clues = [
		{ number: 1, direction: 'across', isFilled: false, cells: [cells[0], cells[1]] },
		{ number: 2, direction: 'across', isFilled: false, cells: [cells[2], cells[3]] },
		{ number: 1, direction: 'down', isFilled: false, cells: [cells[0]] }
	];
	const sorted = [...cells];

	it('advances to next clue forward', () => {
		const result = getNextClueCell({
			clues,
			cells,
			focusedCell: cells[0],
			focusedDirection: 'across',
			sortedCellsInDirection: sorted,
			diff: 1
		});
		expect(result.focusedCellIndex).toBe(2);
		expect(result.focusedDirection).toBe('across');
	});

	it('wraps to other direction when no more clues', () => {
		const result = getNextClueCell({
			clues,
			cells,
			focusedCell: cells[2],
			focusedDirection: 'across',
			sortedCellsInDirection: sorted,
			diff: 1
		});
		expect(result.focusedDirection).toBe('down');
	});

	it('goes backward with negative diff', () => {
		const result = getNextClueCell({
			clues,
			cells,
			focusedCell: cells[2],
			focusedDirection: 'across',
			sortedCellsInDirection: sorted,
			diff: -1
		});
		expect(result.focusedCellIndex).toBe(0);
	});

	it('handles all clues filled by including filled clues in search', () => {
		const allFilled = clues.map((c) => ({ ...c, isFilled: true }));
		const result = getNextClueCell({
			clues: allFilled,
			cells,
			focusedCell: cells[0],
			focusedDirection: 'across',
			sortedCellsInDirection: sorted,
			diff: 1
		});
		expect(result.focusedCellIndex).toBe(2);
	});

	it('falls back to any cell with matching clue number when all are filled', () => {
		const filledCells = [
			{ index: 0, value: 'X', clueNumbers: { across: 1, down: 1 } },
			{ index: 1, value: 'Y', clueNumbers: { across: 1, down: null } },
			{ index: 2, value: 'Z', clueNumbers: { across: 2, down: null } },
			{ index: 3, value: 'W', clueNumbers: { across: 2, down: null } }
		];
		const partialClues = [
			{ number: 1, direction: 'across', isFilled: false },
			{ number: 2, direction: 'across', isFilled: false },
			{ number: 1, direction: 'down', isFilled: false }
		];
		const result = getNextClueCell({
			clues: partialClues,
			cells: filledCells,
			focusedCell: filledCells[0],
			focusedDirection: 'across',
			sortedCellsInDirection: filledCells,
			diff: 1
		});
		expect(result.focusedCellIndex).toBe(2);
	});
});

describe('getMoveFocusResult', () => {
	it('returns direction change when direction differs', () => {
		const result = getMoveFocusResult({
			direction: 'down',
			diff: 1,
			cells: [],
			focusedDirection: 'across',
			focusedCell: { x: 0, y: 0 }
		});
		expect(result).toEqual({ focusedDirection: 'down' });
	});

	it('returns null when no next cell in same direction', () => {
		const cells = [{ x: 0, y: 0, index: 0 }];
		const result = getMoveFocusResult({
			direction: 'across',
			diff: 1,
			cells,
			focusedDirection: 'across',
			focusedCell: { x: 0, y: 0 }
		});
		expect(result).toBeNull();
	});

	it('returns cell index when next cell exists', () => {
		const cells = [
			{ x: 0, y: 0, index: 0 },
			{ x: 1, y: 0, index: 1 }
		];
		const result = getMoveFocusResult({
			direction: 'across',
			diff: 1,
			cells,
			focusedDirection: 'across',
			focusedCell: { x: 0, y: 0 }
		});
		expect(result).toEqual({ focusedCellIndex: 1 });
	});
});
