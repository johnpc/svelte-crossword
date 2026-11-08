import type { DatabaseSync } from 'node:sqlite';
import { toSqlParams } from '../db/params';

export interface AdminSqlEvent {
	sql?: unknown;
	params?: unknown;
}

/** Statements that produce rows; everything else is run for its side effects. */
const READ_VERBS = /^\s*(?:--[^\n]*\n\s*)*(select|with|pragma|explain)\b/i;

export const isReadStatement = (sql: string): boolean => READ_VERBS.test(sql);

/**
 * Executes one parameterized statement from a laptop admin script and returns
 * a mysql2-shaped result: `rows` is the result set for reads, or an
 * `{ affectedRows }` header for writes, so scripts/admin-sql-client.ts call
 * sites keep reading like `const [rows] = await execute(...)`.
 */
export function executeAdminSql(db: DatabaseSync, event: AdminSqlEvent) {
	const { sql, params } = event;
	if (typeof sql !== 'string' || sql.trim() === '') {
		throw new Error('Payload must be { sql: string, params?: unknown[] }');
	}
	if (params !== undefined && !Array.isArray(params)) {
		throw new Error('params must be an array when provided');
	}
	const bound = toSqlParams(params ?? []);
	const statement = db.prepare(sql);
	if (isReadStatement(sql)) return { rows: statement.all(...bound) };
	const { changes, lastInsertRowid } = statement.run(...bound);
	return { rows: { affectedRows: Number(changes), insertId: Number(lastInsertRowid) } };
}
