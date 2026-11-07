// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
	buildInsert,
	countFrom,
	countSql,
	normalizeValue,
	rowsMatch,
	sampleIds,
	selectPage,
	TABLES
} from './migration-helpers';

const profiles = TABLES[0];

describe('TABLES', () => {
	it('lists parents before children so foreign keys resolve', () => {
		expect(TABLES.map((t) => t.name)).toEqual(['profiles', 'puzzles', 'user_puzzles']);
	});
});

describe('selectPage', () => {
	it('keyset-paginates by id', () => {
		expect(selectPage(profiles, 'abc')).toEqual({
			sql: 'SELECT id, user_id, name, email, created_at, updated_at FROM profiles WHERE id > ? ORDER BY id LIMIT 500',
			params: ['abc']
		});
	});
	it('narrows to a created_at window when since is given', () => {
		const page = selectPage(profiles, '', '2026-11-10T00:00:00Z');
		expect(page.sql).toContain('WHERE id > ? AND created_at >= ? ORDER BY id LIMIT 500');
		expect(page.params).toEqual(['', '2026-11-10T00:00:00Z']);
	});
});

describe('normalizeValue', () => {
	it('coerces to SQLite-bindable values', () => {
		expect(normalizeValue(undefined)).toBeNull();
		expect(normalizeValue(null)).toBeNull();
		expect(normalizeValue(true)).toBe(1);
		expect(normalizeValue(false)).toBe(0);
		expect(normalizeValue({ type: 'Buffer', data: [1] })).toBe('{"type":"Buffer","data":[1]}');
		expect(normalizeValue('2026-01-01T00:00:00.000Z')).toBe('2026-01-01T00:00:00.000Z');
		expect(normalizeValue(7)).toBe(7);
	});
});

describe('buildInsert', () => {
	it('emits one INSERT OR IGNORE with a tuple per row and flattened params', () => {
		const rows = [
			{ id: 'a', user_id: 'a', name: 'A', email: 'a@x', created_at: 'c1', updated_at: 'u1' },
			{ id: 'b', user_id: 'b', name: 'B', email: undefined, created_at: 'c2', updated_at: 'u2' }
		];
		const { sql, params } = buildInsert(profiles, rows);
		expect(sql).toBe(
			'INSERT OR IGNORE INTO profiles (id, user_id, name, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)'
		);
		expect(params).toEqual(['a', 'a', 'A', 'a@x', 'c1', 'u1', 'b', 'b', 'B', null, 'c2', 'u2']);
	});
});

describe('count helpers', () => {
	it('builds and reads a COUNT(*) query', () => {
		expect(countSql(profiles)).toBe('SELECT COUNT(*) AS n FROM profiles');
		expect(countFrom([{ n: 12 }])).toBe(12);
		expect(countFrom([{ n: '3' }])).toBe(3);
		expect(countFrom([])).toBe(0);
		expect(countFrom(undefined)).toBe(0);
	});
});

describe('sampleIds', () => {
	it('returns everything when small, else evenly spaced picks', () => {
		expect(sampleIds(['a', 'b'], 5)).toEqual(['a', 'b']);
		expect(sampleIds(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], 5)).toEqual([
			'a',
			'c',
			'e',
			'g',
			'i'
		]);
	});
});

describe('rowsMatch', () => {
	it('compares the table columns after normalisation', () => {
		const a = { id: 'a', user_id: 'a', name: 'A', email: 'e', created_at: 'c', updated_at: 'u' };
		expect(rowsMatch(profiles, a, { ...a })).toBe(true);
		expect(rowsMatch(profiles, a, { ...a, name: 'B' })).toBe(false);
		expect(rowsMatch(profiles, { ...a, email: undefined }, { ...a, email: null })).toBe(true);
	});
});
