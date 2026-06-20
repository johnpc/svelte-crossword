import { describe, it, expect } from 'vitest';
import { buildWordIndex, getCandidates } from './word-index';

describe('word-index', () => {
	describe('buildWordIndex', () => {
		it('indexes each position separately', () => {
			const index = buildWordIndex(['ABCDE', 'FGHIJ']);
			expect(index.get(0)?.get('A')).toEqual(['ABCDE']);
			expect(index.get(0)?.get('F')).toEqual(['FGHIJ']);
			expect(index.get(4)?.get('E')).toEqual(['ABCDE']);
			expect(index.get(4)?.get('J')).toEqual(['FGHIJ']);
		});

		it('groups multiple words sharing a letter at a position', () => {
			const index = buildWordIndex(['APPLE', 'AMPLE']);
			expect(index.get(0)?.get('A')).toEqual(['APPLE', 'AMPLE']);
		});

		it('handles space as a letter (encoding for black squares)', () => {
			const index = buildWordIndex([' WORD', 'WORD ']);
			expect(index.get(0)?.get(' ')).toEqual([' WORD']);
			expect(index.get(4)?.get(' ')).toEqual(['WORD ']);
		});

		it('returns an empty index for an empty list', () => {
			const index = buildWordIndex([]);
			for (let p = 0; p < 5; p++) expect(index.get(p)?.size).toBe(0);
		});
	});

	describe('getCandidates', () => {
		const index = buildWordIndex(['APPLE', 'AMPLE', 'BAGEL', 'PASTE']);

		it('returns empty when no positions are constrained (no candidates set seeded)', () => {
			// getCandidates is the row-fill primitive: callers always pass at least
			// one constraint. With nothing fixed there's nothing to intersect against,
			// so it returns []. The "all words" case is handled by callers using the
			// raw word list directly.
			expect(getCandidates(index, [null, null, null, null, null])).toEqual([]);
		});

		it('filters by a single positional constraint', () => {
			const candidates = getCandidates(index, ['A', null, null, null, null]);
			expect(candidates.sort()).toEqual(['AMPLE', 'APPLE']);
		});

		it('intersects multiple positional constraints', () => {
			const candidates = getCandidates(index, ['A', null, 'P', null, null]);
			expect(candidates.sort()).toEqual(['AMPLE', 'APPLE']);
		});

		it('returns nothing when constraints are unsatisfiable', () => {
			const candidates = getCandidates(index, ['Z', null, null, null, null]);
			expect(candidates).toEqual([]);
		});

		it('returns nothing when the constrained position has no words', () => {
			const tinyIndex = buildWordIndex(['APPLE']);
			expect(getCandidates(tinyIndex, [null, null, null, null, 'X'])).toEqual([]);
		});
	});
});
