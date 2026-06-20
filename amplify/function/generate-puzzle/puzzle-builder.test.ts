import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	todayDateString,
	puzzleIdFor,
	generateUniqueGrid,
	buildPuzzleJson
} from './puzzle-builder';

vi.mock('./grid-generator', () => ({
	generateGrid: vi.fn()
}));

vi.mock('./format-puzzle', () => ({
	formatPuzzle: vi.fn(() => ({
		header: { title: 'mock' },
		puzzle: { solution: 's', state: '-' },
		clues: { across: {}, down: {} },
		board: []
	}))
}));

import { generateGrid } from './grid-generator';

describe('puzzle-builder', () => {
	describe('todayDateString', () => {
		it('returns a YYYY-MM-DD string', () => {
			expect(todayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});
	});

	describe('puzzleIdFor', () => {
		it('prefixes the date with "generated-"', () => {
			expect(puzzleIdFor('2026-06-21')).toBe('generated-2026-06-21');
		});
	});

	describe('generateUniqueGrid', () => {
		beforeEach(() => vi.mocked(generateGrid).mockReset());
		it('returns the first non-null grid', () => {
			vi.mocked(generateGrid).mockReturnValueOnce({
				across: ['A', 'B', 'C', 'D', 'E'],
				down: ['A', 'B', 'C', 'D', 'E'],
				solution: 'first'
			});
			const result = generateUniqueGrid(['ANY']);
			expect(result?.solution).toBe('first');
		});

		it('returns null when every attempt fails', () => {
			vi.mocked(generateGrid).mockReturnValue(null);
			expect(generateUniqueGrid(['ANY'])).toBeNull();
		});

		it('returns the first valid candidate', () => {
			vi.mocked(generateGrid)
				.mockReturnValueOnce(null)
				.mockReturnValueOnce({ across: [], down: [], solution: 'first' });
			expect(generateUniqueGrid(['ANY'])?.solution).toBe('first');
		});

		it('takes the first candidate even if subsequent calls would dup it', () => {
			// generateUniqueGrid's seenSolutions starts empty, so the first
			// non-null candidate always wins. This test confirms the function
			// short-circuits and never calls generateGrid again.
			vi.mocked(generateGrid).mockReturnValueOnce({
				across: [],
				down: [],
				solution: 'unique'
			});
			const result = generateUniqueGrid(['ANY']);
			expect(result?.solution).toBe('unique');
			expect(vi.mocked(generateGrid)).toHaveBeenCalledTimes(1);
		});
	});

	describe('buildPuzzleJson', () => {
		it('delegates to formatPuzzle', () => {
			const result = buildPuzzleJson(
				{ across: [], down: [], solution: '' },
				{ title: '', theme: '', across: {}, down: {} }
			);
			expect(result.header.title).toBe('mock');
		});
	});
});
