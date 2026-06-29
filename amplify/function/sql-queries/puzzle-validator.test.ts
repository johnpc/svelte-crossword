import { describe, it, expect } from 'vitest';
import { fullyDecode, countClues, isValidPuzzle } from './puzzle-validator';

const goodAi = {
	header: { title: 'Good', author: 'robot' },
	puzzle: { solution: 'PODXXEROSXREUPSXOSAYXXETD', state: '' },
	clues: { across: { '1': {}, '2': {} }, down: { '3': {}, '4': {} } }
};

const goodLegacy = {
	header: { title: null, numberOfClues: 10 },
	puzzle: { solution: 'POD..EROS.REUPS.OSAY..ETD', state: '' },
	details: { clues: new Array(10).fill({}) }
};

const blackMini = {
	header: { title: 'Black Mini', numberOfClues: 0 },
	puzzle: { solution: '.........................', state: '' },
	clues: { across: {}, down: {} },
	details: { clues: [] }
};

describe('fullyDecode', () => {
	it('parses a plain object', () => {
		expect(fullyDecode(goodAi)).toEqual(goodAi);
	});
	it('parses a single-encoded string', () => {
		expect(fullyDecode(JSON.stringify(goodAi))).toEqual(goodAi);
	});
	it('parses a double-encoded string (legacy seed shape)', () => {
		expect(fullyDecode(JSON.stringify(JSON.stringify(goodLegacy)))).toEqual(goodLegacy);
	});
	it('returns null for unparseable input', () => {
		expect(fullyDecode('{not json')).toBeNull();
	});
});

describe('countClues', () => {
	it('counts AI across/down map shape', () => {
		expect(countClues(goodAi)).toBe(4);
	});
	it('counts legacy details.clues array shape', () => {
		expect(countClues(goodLegacy)).toBe(10);
	});
	it('returns 0 for an empty puzzle', () => {
		expect(countClues(blackMini)).toBe(0);
	});
	it('counts a top-level clues array', () => {
		expect(countClues({ clues: [{}, {}, {}] })).toBe(3);
	});
	it('handles a map with only across (down missing)', () => {
		expect(countClues({ clues: { across: { '1': {}, '2': {} } } })).toBe(2);
	});
	it('returns 0 for null/non-object input', () => {
		expect(countClues(null)).toBe(0);
		expect(countClues('nope')).toBe(0);
	});
	it('returns 0 when clues is a primitive', () => {
		expect(countClues({ clues: 5 })).toBe(0);
	});
	it('takes the larger of map vs details counts', () => {
		expect(countClues({ clues: { across: { '1': {} } }, details: { clues: [{}, {}, {}] } })).toBe(
			3
		);
	});
});

describe('isValidPuzzle', () => {
	it('accepts a valid AI puzzle', () => {
		expect(isValidPuzzle(goodAi)).toBe(true);
	});
	it('accepts a valid legacy puzzle (double-encoded)', () => {
		expect(isValidPuzzle(JSON.stringify(JSON.stringify(goodLegacy)))).toBe(true);
	});
	it('rejects an all-black, clueless puzzle', () => {
		expect(isValidPuzzle(JSON.stringify(blackMini))).toBe(false);
	});
	it('rejects a puzzle with clues but an all-dot solution', () => {
		const bogus = { ...goodAi, puzzle: { solution: '.........................', state: '' } };
		expect(isValidPuzzle(bogus)).toBe(false);
	});
	it('rejects undecodable input', () => {
		expect(isValidPuzzle('{not json')).toBe(false);
	});
});
