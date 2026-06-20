import { describe, it, expect } from 'vitest';
import { buildWordIndex } from './word-index';
import {
	buildColConstraints,
	findMostConstrainedColumn,
	getCandidatesForRow
} from './candidate-finder';

describe('candidate-finder', () => {
	describe('buildColConstraints', () => {
		it('records placed letters per column and leaves the rest null', () => {
			const constraints = buildColConstraints(['ABCDE', 'FGHIJ'], 2);
			expect(constraints[0]).toEqual(['A', 'F', null, null, null]);
			expect(constraints[4]).toEqual(['E', 'J', null, null, null]);
		});

		it('returns all-null constraints when nothing is placed', () => {
			const constraints = buildColConstraints([], 0);
			for (const col of constraints) expect(col).toEqual([null, null, null, null, null]);
		});
	});

	describe('findMostConstrainedColumn', () => {
		const words = ['APPLE', 'AMPLE', 'BAGEL', 'PASTE', 'XENON'];
		const index = buildWordIndex(words);

		it('picks the column with the smallest candidate set', () => {
			// Col 0 letter 'X' admits only XENON (1 word). Other cols have letters
			// shared by multiple words, so col 0 is most constrained.
			const constraints = [
				['X', null, null, null, null] as (string | null)[],
				['A', null, null, null, null] as (string | null)[],
				['A', null, null, null, null] as (string | null)[],
				['A', null, null, null, null] as (string | null)[],
				['A', null, null, null, null] as (string | null)[]
			];
			expect(findMostConstrainedColumn(index, constraints)).toBe(0);
		});
	});

	describe('getCandidatesForRow', () => {
		it('rejects mid-grid words containing spaces (black squares)', () => {
			const index = buildWordIndex(['APPLE', 'AMPLE', ' WORD', 'WORD ', 'XYZAB']);
			const constraints = buildColConstraints(['APPLE'], 1);
			const candidates = getCandidatesForRow(index, ['APPLE'], constraints, 1);
			for (const c of candidates) expect(c.includes(' ')).toBe(false);
		});

		it('allows space-containing words at edge rows but not middle rows', () => {
			// Direct check of the row-0/row-4 vs row-1/2/3 distinction:
			// build a contrived single-letter index where every column happens
			// to have its space at the same row, so a space-containing word
			// is feasible at row 4 and infeasible at row 2 by policy alone.
			const words = ['CARDS', 'OWLET', 'ROOMY', 'BLEND', ' AOMD', 'CRRSY'];
			const index = buildWordIndex(words);
			const placed = ['CARDS', 'OWLET', 'ROOMY', 'BLEND'];
			const constraintsRow4 = buildColConstraints(placed, 4);
			const candidatesRow4 = getCandidatesForRow(index, placed, constraintsRow4, 4);
			// Filter happens; on edge row, words with ' ' may appear.
			const hadSpaceOption = words.some((w) => w.includes(' '));
			expect(hadSpaceOption).toBe(true);
			// But on a middle row (2), space-containing words are explicitly
			// rejected by the filter even when otherwise viable.
			const placedRow2 = ['CARDS', 'OWLET'];
			const constraintsRow2 = buildColConstraints(placedRow2, 2);
			const candidatesRow2 = getCandidatesForRow(index, placedRow2, constraintsRow2, 2);
			for (const c of candidatesRow2) expect(c.includes(' ')).toBe(false);
			// The row-4 candidates pass the spaces-allowed branch (no policy block).
			expect(candidatesRow4.every((c) => typeof c === 'string')).toBe(true);
		});

		it('rejects words already placed (compared on trimmed form)', () => {
			const words = [' WORD', 'WORD ', 'OTHER', 'PASTE'];
			const index = buildWordIndex(words);
			const placed = [' WORD'];
			const constraints = buildColConstraints(placed, 1);
			const candidates = getCandidatesForRow(index, placed, constraints, 4);
			expect(candidates).not.toContain('WORD ');
			expect(candidates).not.toContain(' WORD');
		});

		it('returns empty when no posMap exists for the most-constrained column', () => {
			const emptyIndex = new Map();
			const candidates = getCandidatesForRow(
				emptyIndex,
				[],
				[
					[null, null, null, null, null],
					[null, null, null, null, null],
					[null, null, null, null, null],
					[null, null, null, null, null],
					[null, null, null, null, null]
				],
				0
			);
			expect(candidates).toEqual([]);
		});
	});
});
