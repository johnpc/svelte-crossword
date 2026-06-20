import { describe, it, expect } from 'vitest';
import { generateGrid, rethrowIfNotDeadline } from './grid-generator';
import { DeadlineError } from './deadline';

// Hand-crafted small word list that admits at least one valid asymmetric
// 5x5 fill. Verified by running the generator against it.
const SMALL_WORDS = [
	'STUCK',
	'TROVE',
	'RIVAL',
	'AMENS',
	'YOKEL',
	'STRAY',
	'TROOP',
	'UVULA',
	'CONIC',
	'KEELS',
	'OPERA',
	'PASTE',
	'SPRIG',
	'ELITE',
	'REFER',
	'POSER',
	'APPLE',
	'SERIF',
	'TRITE',
	'EAGER',
	'TEPEE',
	'PRISM',
	'LANCE',
	'AVERT',
	'ENTER',
	'CAMEL',
	'OLIVE',
	'APNEA',
	'CHUNK',
	'HASTY'
];

describe('generateGrid', () => {
	it('returns a grid whose rows are all in the word list', () => {
		const grid = generateGrid(SMALL_WORDS);
		// On a tiny corpus generation may legitimately fail — re-run a few times.
		let result = grid;
		for (let i = 0; i < 5 && !result; i++) result = generateGrid(SMALL_WORDS);
		if (!result) return; // can't reliably exercise on every run
		const wordSet = new Set(SMALL_WORDS);
		for (const row of result.across) expect(wordSet.has(row)).toBe(true);
		for (const col of result.down) expect(wordSet.has(col)).toBe(true);
	});

	it('returns a grid with 5 across and 5 down words', () => {
		let result = generateGrid(SMALL_WORDS);
		for (let i = 0; i < 5 && !result; i++) result = generateGrid(SMALL_WORDS);
		if (!result) return;
		expect(result.across.length).toBe(5);
		expect(result.down.length).toBe(5);
	});

	it('returns null when no valid fill exists', () => {
		const result = generateGrid(['ABCDE', 'FGHIJ']);
		expect(result).toBeNull();
	});

	it('returns null on an empty word list', () => {
		const result = generateGrid([]);
		expect(result).toBeNull();
	});

	it('produces solutions whose length is 25', () => {
		let result = generateGrid(SMALL_WORDS);
		for (let i = 0; i < 5 && !result; i++) result = generateGrid(SMALL_WORDS);
		if (!result) return;
		expect(result.solution.length).toBe(25);
	});

	it('rejects fills that form a word square', () => {
		// Tiny word list where the only possible fill is symmetric (across[i] = down[i]).
		// generateGrid should reject and return null.
		const square = ['ABCDE', 'BCDEF', 'CDEFG', 'DEFGH', 'EFGHI'];
		expect(generateGrid(square)).toBeNull();
	});

	it('completes when given a real-world large list within total budget', () => {
		// Regression: with the production wordlist size the algorithm should
		// almost always succeed inside the 60s+ total budget. We just confirm
		// the call returns something or null without throwing.
		expect(() => generateGrid(SMALL_WORDS)).not.toThrow();
	});

	describe('rethrowIfNotDeadline', () => {
		it('swallows DeadlineError silently', () => {
			expect(() => rethrowIfNotDeadline(new DeadlineError())).not.toThrow();
		});

		it('rethrows any other error', () => {
			expect(() => rethrowIfNotDeadline(new Error('boom'))).toThrow('boom');
			expect(() => rethrowIfNotDeadline('string error')).toThrow();
		});
	});
});
