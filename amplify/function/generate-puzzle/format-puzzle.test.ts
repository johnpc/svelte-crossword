import { describe, it, expect } from 'vitest';
import { formatPuzzle } from './format-puzzle';

const ALL_WHITE_GRID = {
	across: ['POSER', 'APPLE', 'SERIF', 'TRITE', 'EAGER'],
	down: ['PASTE', 'OPERA', 'SPRIG', 'ELITE', 'REFER'],
	solution: 'POSERAPPLESERIFTRITEEAGER'
};

const ALL_WHITE_CLUES = {
	title: 'Test',
	theme: 'test',
	across: { POSER: 'a', APPLE: 'b', SERIF: 'c', TRITE: 'd', EAGER: 'e' },
	down: { PASTE: 'f', OPERA: 'g', SPRIG: 'h', ELITE: 'i', REFER: 'j' }
};

const CORNER_BLACK_GRID = {
	across: [' BCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWX '],
	down: [' FKPU', 'BGLQV', 'CHMRW', 'DINSX', 'EJOTW '],
	solution: '.BCDEFGHIJKLMNOPQRSTUVWX.'
};

const CORNER_BLACK_CLUES = {
	title: 'Cornered',
	theme: 'corners',
	across: { BCDE: 'top', FGHIJ: 'r1', KLMNO: 'r2', PQRST: 'r3', UVWX: 'bottom' },
	down: { FKPU: 'left', BGLQV: 'd1', CHMRW: 'd2', DINSX: 'd3', EJOTW: 'right' }
};

describe('formatPuzzle', () => {
	it('produces 5 across and 5 down clues for an all-white grid', () => {
		const puz = formatPuzzle(ALL_WHITE_GRID, ALL_WHITE_CLUES);
		expect(Object.keys(puz.clues.across).length).toBe(5);
		expect(Object.keys(puz.clues.down).length).toBe(5);
	});

	it('numbers all-white grids 1,6,7,8,9 across and 1-5 down', () => {
		const puz = formatPuzzle(ALL_WHITE_GRID, ALL_WHITE_CLUES);
		expect(
			Object.keys(puz.clues.across)
				.map(Number)
				.sort((a, b) => a - b)
		).toEqual([1, 6, 7, 8, 9]);
		expect(
			Object.keys(puz.clues.down)
				.map(Number)
				.sort((a, b) => a - b)
		).toEqual([1, 2, 3, 4, 5]);
	});

	it('threads supplied clue text into the output', () => {
		const puz = formatPuzzle(ALL_WHITE_GRID, ALL_WHITE_CLUES);
		expect(puz.clues.across['1'].clue).toBe('a');
		expect(puz.clues.across['1'].answer).toBe('POSER');
	});

	it('falls back to a placeholder when a clue is missing for an answer', () => {
		const partialClues = { ...ALL_WHITE_CLUES, across: { ...ALL_WHITE_CLUES.across, POSER: '' } };
		const puz = formatPuzzle(ALL_WHITE_GRID, partialClues);
		expect(puz.clues.across['1'].clue).toBe('POSER clue');
	});

	it('header reflects title, author, and clue count', () => {
		const puz = formatPuzzle(ALL_WHITE_GRID, ALL_WHITE_CLUES);
		expect(puz.header.title).toBe('Test');
		expect(puz.header.author).toBe('xwords robot');
		expect(puz.header.numberOfClues).toBe(10);
	});

	it('handles corner-black grids: fewer slots, blank corner cells', () => {
		const puz = formatPuzzle(CORNER_BLACK_GRID, CORNER_BLACK_CLUES);
		expect(puz.board[0][0].isBlank).toBe(true);
		expect(puz.board[4][4].isBlank).toBe(true);
		// Solution string has '.' at corners
		expect(puz.puzzle.solution[0]).toBe('.');
		expect(puz.puzzle.solution[24]).toBe('.');
	});

	it('strips spaces from answers when building corner-black clues', () => {
		const puz = formatPuzzle(CORNER_BLACK_GRID, CORNER_BLACK_CLUES);
		for (const c of Object.values(puz.clues.across)) {
			expect(c.answer.includes(' ')).toBe(false);
		}
		for (const c of Object.values(puz.clues.down)) {
			expect(c.answer.includes(' ')).toBe(false);
		}
	});
});
