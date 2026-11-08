// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestDatabase } from '../db/test-db';
import { executeAdminSql, isReadStatement } from './execute-admin-sql';

let t: ReturnType<typeof createTestDatabase>;
beforeEach(() => {
	t = createTestDatabase();
});
afterEach(() => t.cleanup());

describe('isReadStatement', () => {
	it('recognises row-producing statements, including comment-prefixed ones', () => {
		expect(isReadStatement('SELECT 1')).toBe(true);
		expect(isReadStatement('  with x as (select 1) select * from x')).toBe(true);
		expect(isReadStatement('-- count\nSELECT COUNT(*) FROM profiles')).toBe(true);
		expect(isReadStatement('PRAGMA journal_mode')).toBe(true);
		expect(isReadStatement("INSERT INTO t VALUES ('select')")).toBe(false);
		expect(isReadStatement('DELETE FROM profiles WHERE id = ?')).toBe(false);
	});
});

describe('executeAdminSql', () => {
	it('returns rows for reads', () => {
		expect(executeAdminSql(t.db, { sql: 'SELECT 1 AS one, ? AS two', params: ['x'] })).toEqual({
			rows: [{ one: 1, two: 'x' }]
		});
	});

	it('returns a mysql2-style header for writes and coerces loose params', () => {
		const insert = executeAdminSql(t.db, {
			sql: 'INSERT INTO puzzles (id, puz_json, puz_key) VALUES (?, ?, ?)',
			params: ['p', '{}', undefined]
		});
		expect(insert.rows).toEqual({ affectedRows: 1, insertId: 1 });
		expect(executeAdminSql(t.db, { sql: 'SELECT puz_key FROM puzzles' })).toEqual({
			rows: [{ puz_key: null }]
		});
		const del = executeAdminSql(t.db, { sql: 'DELETE FROM puzzles WHERE id = ?', params: ['p'] });
		expect(del.rows).toEqual({ affectedRows: 1, insertId: 1 });
		expect(executeAdminSql(t.db, { sql: 'SELECT COUNT(*) AS n FROM puzzles' })).toEqual({
			rows: [{ n: 0 }]
		});
	});

	it('rejects malformed payloads', () => {
		expect(() => executeAdminSql(t.db, {})).toThrow(/Payload must be/);
		expect(() => executeAdminSql(t.db, { sql: '   ' })).toThrow(/Payload must be/);
		expect(() => executeAdminSql(t.db, { sql: 42 })).toThrow(/Payload must be/);
		expect(() => executeAdminSql(t.db, { sql: 'SELECT 1', params: 'x' })).toThrow(
			/params must be an array/
		);
	});
});
