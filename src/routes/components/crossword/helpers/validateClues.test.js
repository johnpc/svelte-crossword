import { describe, it, expect, vi } from 'vitest';
import validateClues from './validateClues.js';
import createClues from './createClues.js';

describe('validateClues', () => {
	it('returns true for valid clues', () => {
		const data = createClues([
			{ answer: 'CAT', clue: 'Feline', x: 0, y: 0, direction: 'across' },
			{ answer: 'COP', clue: 'Officer', x: 0, y: 0, direction: 'down' }
		]);
		expect(validateClues(data)).toBe(true);
	});

	it('returns false when a required prop has wrong type', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const data = createClues([{ answer: 'CAT', clue: 'Feline', x: 0, y: 0, direction: 'across' }]);
		/** @type {any} */ (data[0]).clue = 123;
		expect(validateClues(data)).toBe(false);
		vi.restoreAllMocks();
	});

	it('returns false when x is not a number', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const data = createClues([{ answer: 'CAT', clue: 'Feline', x: 0, y: 0, direction: 'across' }]);
		/** @type {any} */ (data[0]).x = 'zero';
		expect(validateClues(data)).toBe(false);
		vi.restoreAllMocks();
	});

	it('returns false when cells at same position have different answers', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const data = createClues([
			{ answer: 'CAT', clue: 'Feline', x: 0, y: 0, direction: 'across' },
			{ answer: 'DOG', clue: 'Canine', x: 0, y: 0, direction: 'down' }
		]);
		// Force conflicting answers at same cell position
		data[1].cells[0].answer = 'D';
		expect(validateClues(data)).toBe(false);
		vi.restoreAllMocks();
	});

	it('returns true when intersecting cells have matching answers', () => {
		const data = createClues([
			{ answer: 'CAT', clue: 'Feline', x: 0, y: 0, direction: 'across' },
			{ answer: 'COP', clue: 'Officer', x: 0, y: 0, direction: 'down' }
		]);
		expect(validateClues(data)).toBe(true);
	});
});
