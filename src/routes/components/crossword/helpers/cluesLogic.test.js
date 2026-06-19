import { describe, it, expect } from 'vitest';
import { getOppositeDirection, getNextClueIndex, getClueTarget } from './cluesLogic.js';

describe('getOppositeDirection', () => {
	it('returns down when given across', () => {
		expect(getOppositeDirection('across')).toBe('down');
	});
	it('returns across when given down', () => {
		expect(getOppositeDirection('down')).toBe('across');
	});
});

describe('getNextClueIndex', () => {
	it('wraps negative index to last clue', () => {
		expect(getNextClueIndex(-1, 10)).toBe(9);
	});
	it('wraps index past end to first clue', () => {
		expect(getNextClueIndex(10, 10)).toBe(0);
	});
	it('returns same index when within bounds', () => {
		expect(getNextClueIndex(5, 10)).toBe(5);
	});
	it('returns 0 for index 0 with multiple clues', () => {
		expect(getNextClueIndex(0, 10)).toBe(0);
	});
	it('returns last valid index when at boundary', () => {
		expect(getNextClueIndex(9, 10)).toBe(9);
	});
});

describe('getClueTarget', () => {
	const clues = [
		{ direction: 'across', id: 'A1', number: 1 },
		{ direction: 'down', id: 'A1', number: 1 },
		{ direction: 'across', id: 'B2', number: 2 }
	];
	const cellIndexMap = { A1: 0, B2: 3 };

	it('sets direction and cell index when clicking a different cell', () => {
		const result = getClueTarget({
			direction: 'across',
			id: 'B2',
			cellIndexMap,
			clues,
			focusedCellIndex: 0,
			focusedDirection: 'across'
		});
		expect(result).toEqual({ focusedDirection: 'across', focusedCellIndex: 3 });
	});

	it('flips direction when clicking same cell and direction with opposite clue', () => {
		const result = getClueTarget({
			direction: 'across',
			id: 'A1',
			cellIndexMap,
			clues,
			focusedCellIndex: 0,
			focusedDirection: 'across'
		});
		expect(result).toEqual({ focusedDirection: 'down', focusedCellIndex: 0 });
	});

	it('keeps direction when clicking same cell but no opposite clue exists', () => {
		const result = getClueTarget({
			direction: 'across',
			id: 'B2',
			cellIndexMap,
			clues,
			focusedCellIndex: 3,
			focusedDirection: 'across'
		});
		expect(result).toEqual({ focusedDirection: 'across', focusedCellIndex: 3 });
	});

	it('sets direction when clicking same cell but different direction', () => {
		const result = getClueTarget({
			direction: 'down',
			id: 'A1',
			cellIndexMap,
			clues,
			focusedCellIndex: 0,
			focusedDirection: 'across'
		});
		expect(result).toEqual({ focusedDirection: 'down', focusedCellIndex: 0 });
	});

	it('defaults targetCellIndex to 0 when id not in cellIndexMap', () => {
		const result = getClueTarget({
			direction: 'across',
			id: 'UNKNOWN',
			cellIndexMap,
			clues,
			focusedCellIndex: 3,
			focusedDirection: 'across'
		});
		expect(result).toEqual({ focusedDirection: 'across', focusedCellIndex: 0 });
	});
});
