/** Pure helpers for scripts/migrate-mysql-to-sqlite.ts (unit-tested; no AWS). */
export interface TableSpec {
	name: string;
	columns: readonly string[];
	/** Rows per Lambda round-trip; puzzles carry large puz_json blobs. */
	pageSize: number;
}

/** Parents first so foreign keys resolve on insert. */
export const TABLES: readonly TableSpec[] = [
	{
		name: 'profiles',
		columns: ['id', 'user_id', 'name', 'email', 'created_at', 'updated_at'],
		pageSize: 500
	},
	{
		name: 'puzzles',
		columns: ['id', 'puz_json', 'puz_key', 'title', 'author', 'created_at', 'updated_at'],
		pageSize: 50
	},
	{
		name: 'user_puzzles',
		columns: [
			'id',
			'profile_id',
			'puzzle_id',
			'used_check',
			'used_reveal',
			'used_clear',
			'time_in_seconds',
			'created_at',
			'updated_at'
		],
		pageSize: 500
	}
];

export type Row = Record<string, unknown>;

/**
 * Keyset-paginated page read; `since` narrows to rows created at/after an ISO
 * timestamp. The page size is inlined (it is our own constant): mysql2 binds
 * numbers as DOUBLE in prepared statements, which MySQL rejects for LIMIT.
 */
export function selectPage(table: TableSpec, afterId: string, since?: string) {
	const where = ['id > ?', ...(since ? ['created_at >= ?'] : [])].join(' AND ');
	const params: unknown[] = [afterId, ...(since ? [since] : [])];
	return {
		sql: `SELECT ${table.columns.join(', ')} FROM ${table.name} WHERE ${where} ORDER BY id LIMIT ${table.pageSize}`,
		params
	};
}

/**
 * MySQL rows arrive through the admin-sql Lambda as JSON: Dates are already
 * ISO strings and BOOLEAN/TINYINT columns are 0/1. Anything else unexpected
 * (booleans, undefined) is coerced to what SQLite binds.
 */
export function normalizeValue(value: unknown): unknown {
	if (value === undefined) return null;
	if (typeof value === 'boolean') return value ? 1 : 0;
	if (value !== null && typeof value === 'object') return JSON.stringify(value);
	return value;
}

/** Multi-row idempotent insert so a re-run (the pre-cutover delta) is a no-op for existing ids. */
export function buildInsert(table: TableSpec, rows: Row[]) {
	const tuple = `(${table.columns.map(() => '?').join(', ')})`;
	const sql = `INSERT OR IGNORE INTO ${table.name} (${table.columns.join(', ')}) VALUES ${rows
		.map(() => tuple)
		.join(', ')}`;
	const params = rows.flatMap((row) => table.columns.map((c) => normalizeValue(row[c])));
	return { sql, params };
}

export const countSql = (table: TableSpec) => `SELECT COUNT(*) AS n FROM ${table.name}`;

export const countFrom = (rows: unknown): number => {
	const first = Array.isArray(rows) ? (rows[0] as { n?: number | string }) : undefined;
	return Number(first?.n ?? 0);
};

/** Picks evenly spaced ids out of a list for spot-checking. */
export function sampleIds(ids: string[], count: number): string[] {
	if (ids.length <= count) return ids;
	const step = ids.length / count;
	return Array.from({ length: count }, (_, i) => ids[Math.floor(i * step)]);
}

/** Row equality after normalisation (MySQL JSON vs SQLite JSON). */
export function rowsMatch(table: TableSpec, a: Row, b: Row): boolean {
	return table.columns.every((c) => normalizeValue(a[c]) === normalizeValue(b[c]));
}
