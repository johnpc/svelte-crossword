import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from './open-database';

/** Fresh on-disk SQLite database in a temp dir, for tests that need the real engine. */
export function createTestDatabase() {
	const dir = mkdtempSync(join(tmpdir(), 'crossword-sqlite-'));
	const path = join(dir, 'crossword.sqlite');
	const db = openDatabase(path);
	return {
		db,
		path,
		dir,
		cleanup: () => {
			if (db.isOpen) db.close();
			rmSync(dir, { recursive: true, force: true });
		}
	};
}
