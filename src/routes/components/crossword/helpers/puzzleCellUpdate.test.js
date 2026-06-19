import { describe, it, expect } from 'vitest';
import { processCellUpdate, classifyKey, processKeyboardEvent } from './puzzleCellUpdate.js';

describe('processCellUpdate', () => {
	const baseCells = [
		{ x: 0, y: 0, index: 0, value: '', clueNumbers: { across: 1, down: 1 } },
		{ x: 1, y: 0, index: 1, value: '', clueNumbers: { across: 1, down: undefined } },
		{ x: 2, y: 0, index: 2, value: '', clueNumbers: { across: 1, down: undefined } }
	];

	it('updates cell value to uppercase', () => {
		const result = processCellUpdate({
			cells: baseCells,
			cellsHistory: [],
			cellsHistoryIndex: 0,
			focusedDirection: 'across',
			focusedCellIndex: 0,
			index: 0,
			newValue: 'a',
			diff: 1,
			doReplaceFilledCells: false
		});
		expect(result.cells[0].value).toBe('A');
	});

	it('resets cellsHistoryIndex to 0', () => {
		const result = processCellUpdate({
			cells: baseCells,
			cellsHistory: [baseCells],
			cellsHistoryIndex: 1,
			focusedDirection: 'across',
			focusedCellIndex: 0,
			index: 0,
			newValue: 'b',
			diff: 1,
			doReplaceFilledCells: false
		});
		expect(result.cellsHistoryIndex).toBe(0);
	});

	it('returns clueDiff navigation when at end of clue and diff > 0', () => {
		const result = processCellUpdate({
			cells: baseCells,
			cellsHistory: [],
			cellsHistoryIndex: 0,
			focusedDirection: 'across',
			focusedCellIndex: 2,
			index: 2,
			newValue: 'c',
			diff: 1,
			doReplaceFilledCells: false
		});
		expect(result.navigationAction.type).toBe('clueDiff');
		expect(result.navigationAction.diff).toBe(1);
	});

	it('returns cellDiff navigation when not at end of clue', () => {
		const result = processCellUpdate({
			cells: baseCells,
			cellsHistory: [],
			cellsHistoryIndex: 0,
			focusedDirection: 'across',
			focusedCellIndex: 0,
			index: 0,
			newValue: 'a',
			diff: 1,
			doReplaceFilledCells: false
		});
		expect(result.navigationAction.type).toBe('cellDiff');
	});

	it('preserves other cells unchanged', () => {
		const result = processCellUpdate({
			cells: baseCells,
			cellsHistory: [],
			cellsHistoryIndex: 0,
			focusedDirection: 'across',
			focusedCellIndex: 1,
			index: 1,
			newValue: 'x',
			diff: 1,
			doReplaceFilledCells: false
		});
		expect(result.cells[0].value).toBe('');
		expect(result.cells[2].value).toBe('');
	});
});

describe('classifyKey', () => {
	it('returns null for ctrl key combinations', () => {
		expect(classifyKey('a', true, false)).toBeNull();
	});

	it('returns null for alt key combinations', () => {
		expect(classifyKey('a', false, true)).toBeNull();
	});

	it('returns delete for Backspace', () => {
		expect(classifyKey('Backspace')).toEqual({ type: 'delete' });
	});

	it('returns delete for Delete', () => {
		expect(classifyKey('Delete')).toEqual({ type: 'delete' });
	});

	it('returns letter with uppercase value for alphabetic keys', () => {
		expect(classifyKey('a')).toEqual({ type: 'letter', value: 'A' });
		expect(classifyKey('Z')).toEqual({ type: 'letter', value: 'Z' });
	});

	it('returns null for non-alphabetic keys', () => {
		expect(classifyKey('1')).toBeNull();
		expect(classifyKey('Enter')).toBeNull();
		expect(classifyKey(' ')).toBeNull();
	});

	it('handles parentheses as valid keys', () => {
		expect(classifyKey('(')).toEqual({ type: 'letter', value: '(' });
		expect(classifyKey(')')).toEqual({ type: 'letter', value: ')' });
	});
});

describe('processKeyboardEvent', () => {
	it('handles Backspace', () => {
		const result = processKeyboardEvent('Backspace');
		expect(result).toEqual({ value: '', diff: -1, doReplaceFilledCells: true });
	});

	it('handles letter input', () => {
		const result = processKeyboardEvent('A');
		expect(result).toEqual({ value: 'A', diff: 1, doReplaceFilledCells: false });
	});
});
