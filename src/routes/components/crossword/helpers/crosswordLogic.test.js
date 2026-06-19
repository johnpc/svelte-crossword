import { describe, it, expect } from 'vitest';
import { checkClueCompletion, clearCells, revealCells, getInitialState } from './crosswordLogic.js';

describe('checkClueCompletion', () => {
	const cells = [
		{ id: 'cell-0-0', value: 'C', answer: 'C', index: 0 },
		{ id: 'cell-1-0', value: 'A', answer: 'A', index: 1 },
		{ id: 'cell-2-0', value: 'T', answer: 'T', index: 2 },
		{ id: 'cell-0-1', value: '', answer: 'O', index: 3 },
		{ id: 'cell-0-2', value: 'X', answer: 'P', index: 4 }
	];
	const clues = [
		{
			answer: 'CAT',
			cells: [
				{ id: 'cell-0-0', answer: 'C' },
				{ id: 'cell-1-0', answer: 'A' },
				{ id: 'cell-2-0', answer: 'T' }
			]
		},
		{
			answer: 'COP',
			cells: [
				{ id: 'cell-0-0', answer: 'C' },
				{ id: 'cell-0-1', answer: 'O' },
				{ id: 'cell-0-2', answer: 'P' }
			]
		}
	];

	it('marks a fully correct clue as isCorrect and isFilled', () => {
		const result = checkClueCompletion(clues, cells);
		expect(result[0].isCorrect).toBe(true);
		expect(result[0].isFilled).toBe(true);
	});

	it('marks a partially filled clue as not isCorrect and not isFilled', () => {
		const result = checkClueCompletion(clues, cells);
		expect(result[1].isCorrect).toBe(false);
		expect(result[1].isFilled).toBe(false);
	});

	it('marks a filled but incorrect clue as isFilled but not isCorrect', () => {
		const filledCells = cells.map((c) => (c.id === 'cell-0-1' ? { ...c, value: 'Z' } : c));
		const result = checkClueCompletion(clues, filledCells);
		expect(result[1].isFilled).toBe(true);
		expect(result[1].isCorrect).toBe(false);
	});

	it('handles missing cells gracefully', () => {
		const result = checkClueCompletion(clues, []);
		expect(result[0].isCorrect).toBe(false);
		expect(result[0].isFilled).toBe(false);
	});
});

describe('clearCells', () => {
	it('returns cells with all values cleared', () => {
		const cells = [
			{ id: 'cell-0-0', value: 'C', answer: 'C' },
			{ id: 'cell-1-0', value: 'A', answer: 'A' }
		];
		const result = clearCells(cells);
		expect(result[0].value).toBe('');
		expect(result[1].value).toBe('');
	});

	it('preserves other cell properties', () => {
		const cells = [{ id: 'cell-0-0', value: 'C', answer: 'C', index: 0 }];
		const result = clearCells(cells);
		expect(result[0].id).toBe('cell-0-0');
		expect(result[0].answer).toBe('C');
		expect(result[0].index).toBe(0);
	});

	it('returns a new array (does not mutate)', () => {
		const cells = [{ id: 'cell-0-0', value: 'C', answer: 'C' }];
		const result = clearCells(cells);
		expect(result).not.toBe(cells);
		expect(result[0]).not.toBe(cells[0]);
	});
});

describe('revealCells', () => {
	it('sets each cell value to its answer', () => {
		const cells = [
			{ id: 'cell-0-0', value: '', answer: 'C' },
			{ id: 'cell-1-0', value: 'X', answer: 'A' }
		];
		const result = revealCells(cells);
		expect(result[0].value).toBe('C');
		expect(result[1].value).toBe('A');
	});

	it('returns a new array (does not mutate)', () => {
		const cells = [{ id: 'cell-0-0', value: '', answer: 'C' }];
		const result = revealCells(cells);
		expect(result).not.toBe(cells);
		expect(result[0]).not.toBe(cells[0]);
	});
});

describe('getInitialState', () => {
	it('returns the default reset state', () => {
		const state = getInitialState();
		expect(state.isRevealing).toBe(false);
		expect(state.isChecking).toBe(false);
		expect(state.focusedCellIndex).toBe(0);
		expect(state.focusedDirection).toBe('across');
	});
});
