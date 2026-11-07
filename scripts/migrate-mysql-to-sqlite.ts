// Copies every row from the MySQL database (via the admin-sql Lambda) into the
// SQLite-on-EFS database (via the admin-sqlite Lambda). Idempotent: inserts
// use INSERT OR IGNORE, so re-running right before cutover only adds the delta.
//
//   AWS_PROFILE=personal npx tsx scripts/migrate-mysql-to-sqlite.ts [--since 2026-11-10T00:00:00Z]
//
// Requires src/amplify_outputs.json with adminSqlFunctionName (MySQL source)
// and adminSqliteFunctionName (SQLite target): `npm run prod-config`.
import { createExecutor, type Executor } from './admin-sql-client';
import {
	buildInsert,
	countFrom,
	countSql,
	rowsMatch,
	sampleIds,
	selectPage,
	TABLES,
	type Row,
	type TableSpec
} from './lib/migration-helpers';

const since = process.argv.includes('--since')
	? process.argv[process.argv.indexOf('--since') + 1]
	: undefined;

const source = createExecutor('adminSqlFunctionName');
const target = createExecutor('adminSqliteFunctionName');

async function copyTable(table: TableSpec): Promise<string[]> {
	const ids: string[] = [];
	let afterId = '';
	for (;;) {
		const page = selectPage(table, afterId, since);
		const [rows] = (await source(page.sql, page.params)) as [Row[]];
		if (rows.length === 0) break;
		const insert = buildInsert(table, rows);
		await target(insert.sql, insert.params);
		rows.forEach((row) => ids.push(String(row.id)));
		afterId = String(rows[rows.length - 1].id);
		process.stdout.write(`  ${table.name}: ${ids.length} rows copied\r`);
	}
	console.log(`  ${table.name}: ${ids.length} rows copied${since ? ` (since ${since})` : ''}`);
	return ids;
}

async function count(exec: Executor, table: TableSpec): Promise<number> {
	const [rows] = await exec(countSql(table));
	return countFrom(rows);
}

async function spotCheck(table: TableSpec, ids: string[]): Promise<number> {
	let mismatches = 0;
	const sql = `SELECT ${table.columns.join(', ')} FROM ${table.name} WHERE id = ?`;
	for (const id of sampleIds(ids, 5)) {
		const [[a]] = (await source(sql, [id])) as [Row[]];
		const [[b]] = (await target(sql, [id])) as [Row[]];
		if (!b || !rowsMatch(table, a, b)) {
			mismatches++;
			console.error(`  MISMATCH ${table.name} id=${id}`, { mysql: a, sqlite: b });
		}
	}
	return mismatches;
}

async function main() {
	let failed = false;
	for (const table of TABLES) {
		console.log(`\n${table.name}`);
		const ids = await copyTable(table);
		const [mysqlCount, sqliteCount] = await Promise.all([
			count(source, table),
			count(target, table)
		]);
		const mismatches = await spotCheck(table, ids);
		const ok = sqliteCount >= mysqlCount && mismatches === 0;
		failed ||= !ok;
		console.log(
			`  mysql=${mysqlCount} sqlite=${sqliteCount} spot-check mismatches=${mismatches} ${ok ? 'OK' : 'FAIL'}`
		);
	}
	if (failed) {
		console.error('\nMigration verification FAILED — do not cut over.');
		process.exit(1);
	}
	console.log('\nMigration verified: SQLite has every MySQL row.');
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
