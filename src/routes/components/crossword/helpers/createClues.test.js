import { describe, it, expect } from 'vitest';
import createClues from './createClues.js';

/** @type {import('./types').ClueInput[]} */
const sampleClues = [
	{ answer: 'CAT', clue: 'A feline', x: 0, y: 0, direction: 'across' },
	{ answer: 'COP', clue: 'An officer', x: 0, y: 0, direction: 'down' },
	{ answer: 'BAT', clue: 'Flying mammal', x: 0, y: 1, direction: 'across' }
];

describe('createClues', () => {
	it('assigns ids based on position', () => {
		const result = createClues(sampleClues);
		result.forEach((clue) => {
			expect(clue.id).toBe(`${clue.x}-${clue.y}`);
		});
	});

	it('assigns clue numbers in order', () => {
		const result = createClues(sampleClues);
		const numbers = result.map((c) => c.number);
		expect(numbers).toContain(1);
		expect(numbers).toContain(2);
	});

	it('reuses clue number for same position across/down', () => {
		const result = createClues(sampleClues);
		const atOrigin = result.filter((c) => c.x === 0 && c.y === 0);
		const uniqueNumbers = new Set(atOrigin.map((c) => c.number));
		expect(uniqueNumbers.size).toBe(1);
	});

	it('creates cells for each letter', () => {
		const result = createClues(sampleClues);
		const cat = /** @type {import('./types').Clue} */ (result.find((c) => c.answer === 'CAT'));
		expect(cat.cells).toHaveLength(3);
	});

	it('cells have correct x/y for across direction', () => {
		const result = createClues(sampleClues);
		const cat = /** @type {import('./types').Clue} */ (result.find((c) => c.answer === 'CAT'));
		expect(cat.cells[0].x).toBe(0);
		expect(cat.cells[1].x).toBe(1);
		expect(cat.cells[2].x).toBe(2);
		cat.cells.forEach((cell) => expect(cell.y).toBe(0));
	});

	it('cells have correct x/y for down direction', () => {
		const result = createClues(sampleClues);
		const cop = /** @type {import('./types').Clue} */ (result.find((c) => c.answer === 'COP'));
		expect(cop.cells[0].y).toBe(0);
		expect(cop.cells[1].y).toBe(1);
		expect(cop.cells[2].y).toBe(2);
		cop.cells.forEach((cell) => expect(cell.x).toBe(0));
	});

	it('cells answers are uppercased', () => {
		/** @type {import('./types').ClueInput[]} */
		const data = [{ answer: 'cat', clue: 'Feline', x: 0, y: 0, direction: 'across' }];
		const result = createClues(data);
		result[0].cells.forEach((cell) => {
			expect(cell.answer).toBe(cell.answer.toUpperCase());
		});
	});

	it('sorts result by direction then number', () => {
		const result = createClues(sampleClues);
		const acrossClues = result.filter((c) => c.direction === 'across');
		const downClues = result.filter((c) => c.direction === 'down');
		expect(result.indexOf(acrossClues[0])).toBeLessThan(result.indexOf(downClues[0]));
	});

	it('assigns index to each clue', () => {
		const result = createClues(sampleClues);
		result.forEach((clue, i) => {
			expect(clue.index).toBe(i);
		});
	});

	it('adjusts for 1-based coordinates', () => {
		/** @type {import('./types').ClueInput[]} */
		const data = [{ answer: 'AB', clue: 'Test', x: 1, y: 1, direction: 'across' }];
		const result = createClues(data);
		expect(result[0].x).toBe(0);
		expect(result[0].y).toBe(0);
	});
});
