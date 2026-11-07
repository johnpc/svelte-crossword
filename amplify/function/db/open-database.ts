import { DatabaseSync } from 'node:sqlite';
import { SCHEMA_STATEMENTS } from './schema';

/**
 * Opens (and if necessary creates) the crossword SQLite database.
 *
 * The file lives on EFS, which is NFS: WAL mode needs shared memory and is
 * unsafe there, so we pin the classic rollback journal. busy_timeout lets a
 * reader wait out the (rare) concurrent writer instead of failing with
 * SQLITE_BUSY. Foreign keys are on to match the MySQL schema's cascades.
 */
export function openDatabase(path: string): DatabaseSync {
	const db = new DatabaseSync(path);
	db.exec('PRAGMA journal_mode=DELETE');
	db.exec('PRAGMA busy_timeout=5000');
	db.exec('PRAGMA foreign_keys=ON');
	for (const statement of SCHEMA_STATEMENTS) db.exec(statement);
	return db;
}

/** Lazily opens one connection per Lambda container and reuses it. */
export function createDatabaseProvider(path: string): () => DatabaseSync {
	let db: DatabaseSync | undefined;
	return () => {
		if (!db || !db.isOpen) db = openDatabase(path);
		return db;
	};
}
