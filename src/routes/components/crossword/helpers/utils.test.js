import { describe, it, expect } from 'vitest';
import { fromPairs } from './utils.js';

describe('fromPairs', () => {
	it('converts an array of pairs to an object', () => {
		const result = fromPairs([
			['a', 1],
			['b', 2],
			['c', 3]
		]);
		expect(result).toEqual({ a: 1, b: 2, c: 3 });
	});

	it('returns an empty object for empty array', () => {
		expect(fromPairs([])).toEqual({});
	});

	it('overwrites duplicate keys with later values', () => {
		const result = fromPairs([
			['a', 1],
			['a', 2]
		]);
		expect(result).toEqual({ a: 2 });
	});

	it('handles string values', () => {
		const result = fromPairs([
			['key', 'value'],
			['name', 'test']
		]);
		expect(result).toEqual({ key: 'value', name: 'test' });
	});
});
