// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { toSqlParams, toSqlValue } from './params';

describe('toSqlValue', () => {
	it('passes through SQLite-native values', () => {
		expect(toSqlValue(null)).toBeNull();
		expect(toSqlValue(3)).toBe(3);
		expect(toSqlValue(10n)).toBe(10n);
		expect(toSqlValue('x')).toBe('x');
		const bytes = new Uint8Array([1, 2]);
		expect(toSqlValue(bytes)).toBe(bytes);
	});
	it('coerces mysql2-era loose values', () => {
		expect(toSqlValue(undefined)).toBeNull();
		expect(toSqlValue(true)).toBe(1);
		expect(toSqlValue(false)).toBe(0);
		expect(toSqlValue(new Date('2026-01-02T03:04:05.000Z'))).toBe('2026-01-02T03:04:05.000Z');
		expect(toSqlValue({ a: 1 })).toBe('{"a":1}');
	});
});

describe('toSqlParams', () => {
	it('maps every element and defaults to an empty list', () => {
		expect(toSqlParams([true, undefined, 'a'])).toEqual([1, null, 'a']);
		expect(toSqlParams()).toEqual([]);
	});
});
