import { describe, it, expect } from 'vitest';
import {
	isFormingWordSquare,
	hasValidBlackPattern,
	isWordSquare,
	readDownWords,
	validateCompleteGrid
} from './grid-rules';

describe('grid-rules', () => {
	describe('isFormingWordSquare', () => {
		it('is false when fewer than 2 rows are placed', () => {
			expect(isFormingWordSquare(['ABCDE'], 1)).toBe(false);
			expect(isFormingWordSquare([], 0)).toBe(false);
		});

		it('detects a partial word square (mirror-equal placement so far)', () => {
			expect(isFormingWordSquare(['ABCDE', 'BFGHI'], 2)).toBe(true);
		});

		it('returns false when partial fill is asymmetric', () => {
			expect(isFormingWordSquare(['ABCDE', 'FGHIJ'], 2)).toBe(false);
		});
	});

	describe('hasValidBlackPattern', () => {
		const allWhite = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXY'];

		it('accepts all-white grids', () => {
			expect(hasValidBlackPattern(allWhite)).toBe(true);
		});

		it('accepts TL+BR diagonal corners', () => {
			expect(hasValidBlackPattern([' BCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWX '])).toBe(true);
		});

		it('accepts TR+BL diagonal corners', () => {
			expect(hasValidBlackPattern(['ABCD ', 'FGHIJ', 'KLMNO', 'PQRST', ' VWXY'])).toBe(true);
		});

		it('accepts all four corners black', () => {
			expect(hasValidBlackPattern([' BCD ', 'FGHIJ', 'KLMNO', 'PQRST', ' VWX '])).toBe(true);
		});

		it('rejects asymmetric corner pattern', () => {
			expect(hasValidBlackPattern([' BCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXY'])).toBe(false);
		});

		it('rejects black squares anywhere except corners', () => {
			expect(hasValidBlackPattern(['ABCDE', 'F GHI', 'KLMNO', 'PQRST', 'UVWXY'])).toBe(false);
		});

		it('rejects black squares on edges that are not corners', () => {
			expect(hasValidBlackPattern(['ABCDE', ' GHIJ', 'KLMNO', 'PQRST', 'UVWXY'])).toBe(false);
		});
	});

	describe('isWordSquare', () => {
		it('detects when across[i] equals down[i] for any i', () => {
			expect(isWordSquare(['ABCDE', 'B', 'C', 'D', 'E'], ['ABCDE', 'X', 'Y', 'Z', 'W'])).toBe(true);
		});

		it('returns false when no rows match the corresponding columns', () => {
			const grid = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXY'];
			const down = readDownWords(grid);
			expect(isWordSquare(grid, down)).toBe(false);
		});
	});

	describe('readDownWords', () => {
		it('reads columns top-to-bottom into 5 strings', () => {
			const result = readDownWords(['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXY']);
			expect(result).toEqual(['AFKPU', 'BGLQV', 'CHMRW', 'DINSX', 'EJOTY']);
		});
	});

	describe('validateCompleteGrid', () => {
		const grid = ['POSER', 'APPLE', 'SERIF', 'TRITE', 'EAGER'];
		const downWords = readDownWords(grid);
		const fullSet = new Set([...grid, ...downWords]);

		it('accepts a valid asymmetric all-white grid', () => {
			expect(validateCompleteGrid(grid, fullSet)).toBe(true);
		});

		it('rejects when a down word is missing from the word set', () => {
			const partial = new Set([...grid, ...downWords.slice(1)]);
			expect(validateCompleteGrid(grid, partial)).toBe(false);
		});

		it('rejects a word square (across[i] === down[i])', () => {
			const square = ['ABCDE', 'BCDEF', 'CDEFG', 'DEFGH', 'EFGHI'];
			const sqDown = readDownWords(square);
			const sqSet = new Set([...square, ...sqDown]);
			expect(validateCompleteGrid(square, sqSet)).toBe(false);
		});

		it('rejects an asymmetric corner-black pattern', () => {
			const asym = [' BCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXY'];
			const asymDown = readDownWords(asym);
			const asymSet = new Set([...asym, ...asymDown]);
			expect(validateCompleteGrid(asym, asymSet)).toBe(false);
		});
	});
});
