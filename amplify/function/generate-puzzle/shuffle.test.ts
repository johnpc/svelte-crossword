import { describe, it, expect } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
	it('returns a new array (not the same reference)', () => {
		const arr = [1, 2, 3];
		const result = shuffle(arr);
		expect(result).not.toBe(arr);
	});

	it('preserves length', () => {
		const result = shuffle([1, 2, 3, 4, 5]);
		expect(result.length).toBe(5);
	});

	it('preserves the multiset of elements', () => {
		const result = shuffle([1, 2, 3, 4, 5]);
		expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
	});

	it('handles empty arrays', () => {
		expect(shuffle([])).toEqual([]);
	});

	it('handles single-element arrays', () => {
		expect(shuffle(['only'])).toEqual(['only']);
	});
});
