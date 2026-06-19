import { describe, it, expect } from 'vitest';
import createCells from './createCells.js';
import createClues from './createClues.js';

/** @type {import('./types').ClueInput[]} */
const sampleClues = [
	{ answer: 'CAT', clue: 'A feline', x: 0, y: 0, direction: 'across' },
	{ answer: 'COP', clue: 'An officer', x: 0, y: 0, direction: 'down' }
];

/**
 * @param {import('./types').ClueInput[]} data
 * @returns {import('./types').Clue[]}
 */
function getProcessedClues(data) {
	return createClues(data);
}

describe('createCells', () => {
	it('deduplicates cells at the same position', () => {
		const clues = getProcessedClues(sampleClues);
		const cells = createCells(clues);
		const ids = cells.map((c) => c.id);
		const uniqueIds = new Set(ids);
		expect(ids.length).toBe(uniqueIds.size);
	});

	it('consolidates clue numbers for intersecting cells', () => {
		const clues = getProcessedClues(sampleClues);
		const cells = createCells(clues);
		const originCell = /** @type {import('./types').Cell} */ (cells.find((c) => c.id === '0-0'));
		expect(originCell.clueNumbers).toHaveProperty('across');
		expect(originCell.clueNumbers).toHaveProperty('down');
	});

	it('sorts cells by y then x', () => {
		const clues = getProcessedClues(sampleClues);
		const cells = createCells(clues);
		for (let i = 1; i < cells.length; i++) {
			const prev = cells[i - 1];
			const curr = cells[i];
			expect(prev.y * 100 + prev.x).toBeLessThanOrEqual(curr.y * 100 + curr.x);
		}
	});

	it('assigns index to each cell', () => {
		const clues = getProcessedClues(sampleClues);
		const cells = createCells(clues);
		cells.forEach((cell, i) => {
			expect(cell.index).toBe(i);
		});
	});

	it('generates the correct total number of unique cells', () => {
		const clues = getProcessedClues(sampleClues);
		const cells = createCells(clues);
		// CAT = C(0,0) A(1,0) T(2,0), COP = C(0,0) O(0,1) P(0,2)
		// unique positions: (0,0) (1,0) (2,0) (0,1) (0,2) = 5
		expect(cells).toHaveLength(5);
	});

	it('consolidates custom classes on duplicate cells', () => {
		/** @type {import('./types').ClueInput[]} */
		const data = [
			{ answer: 'AB', clue: 'test1', x: 0, y: 0, direction: 'across', custom: 'class-a' },
			{ answer: 'AC', clue: 'test2', x: 0, y: 0, direction: 'down', custom: 'class-b' }
		];
		const clues = getProcessedClues(data);
		const cells = createCells(clues);
		const originCell = /** @type {import('./types').Cell} */ (cells.find((c) => c.id === '0-0'));
		expect(originCell.custom).toContain('class-a');
		expect(originCell.custom).toContain('class-b');
	});
});
