import { describe, it, expect } from 'vitest';
import { previewClues } from './previewClues';

describe('previewClues', () => {
	it('contains the expected number of clues', () => {
		expect(previewClues.length).toBe(10);
	});

	it('all clues have required properties', () => {
		previewClues.forEach((clue) => {
			expect(clue).toHaveProperty('answer');
			expect(clue).toHaveProperty('clue');
			expect(clue).toHaveProperty('x');
			expect(clue).toHaveProperty('y');
			expect(clue).toHaveProperty('direction');
		});
	});

	it('all answers are strings', () => {
		previewClues.forEach((clue) => {
			expect(typeof clue.answer).toBe('string');
			expect(clue.answer.length).toBeGreaterThan(0);
		});
	});

	it('directions are only across or down', () => {
		previewClues.forEach((clue) => {
			expect(['across', 'down']).toContain(clue.direction);
		});
	});

	it('coordinates are non-negative numbers', () => {
		previewClues.forEach((clue) => {
			expect(clue.x).toBeGreaterThanOrEqual(0);
			expect(clue.y).toBeGreaterThanOrEqual(0);
		});
	});

	it('has both across and down clues', () => {
		const acrossClues = previewClues.filter((c) => c.direction === 'across');
		const downClues = previewClues.filter((c) => c.direction === 'down');
		expect(acrossClues.length).toBeGreaterThan(0);
		expect(downClues.length).toBeGreaterThan(0);
	});
});
