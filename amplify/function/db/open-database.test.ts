// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { createDatabaseProvider, openDatabase } from './open-database';
import { createTestDatabase } from './test-db';

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
let cleanup = () => {};
afterEach(() => cleanup());

describe('openDatabase', () => {
	it('applies NFS-safe pragmas', () => {
		const t = createTestDatabase();
		cleanup = t.cleanup;
		expect(t.db.prepare('PRAGMA journal_mode').get()).toEqual({ journal_mode: 'delete' });
		expect(t.db.prepare('PRAGMA busy_timeout').get()).toEqual({ timeout: 5000 });
		expect(t.db.prepare('PRAGMA foreign_keys').get()).toEqual({ foreign_keys: 1 });
	});

	it('creates the three tables and is idempotent on reopen', () => {
		const t = createTestDatabase();
		cleanup = t.cleanup;
		const names = () =>
			(
				t.db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as {
					name: string;
				}[]
			).map((r) => r.name);
		expect(names()).toEqual(['profiles', 'puzzles', 'user_puzzles']);
		const again = openDatabase(t.path);
		expect(again.prepare('SELECT COUNT(*) AS n FROM profiles').get()).toEqual({ n: 0 });
		again.close();
	});

	it('defaults created_at to an ISO-8601 UTC string like mysql2 produced', () => {
		const t = createTestDatabase();
		cleanup = t.cleanup;
		t.db.prepare("INSERT INTO profiles (id, user_id, name, email) VALUES ('p','p','n','e')").run();
		const row = t.db.prepare('SELECT created_at, updated_at FROM profiles').get() as {
			created_at: string;
			updated_at: string;
		};
		expect(row.created_at).toMatch(ISO);
		expect(row.updated_at).toMatch(ISO);
	});

	it('bumps updated_at on update and cascades deletes through foreign keys', () => {
		const t = createTestDatabase();
		cleanup = t.cleanup;
		t.db
			.exec(`INSERT INTO profiles (id, user_id, name, email, updated_at) VALUES ('p','p','n','e','2000-01-01T00:00:00.000Z');
			INSERT INTO puzzles (id, puz_json) VALUES ('z','{}');
			INSERT INTO user_puzzles (id, profile_id, puzzle_id, time_in_seconds) VALUES ('u','p','z',10)`);
		t.db.prepare("UPDATE profiles SET name = 'renamed' WHERE id = 'p'").run();
		const { updated_at } = t.db.prepare('SELECT updated_at FROM profiles').get() as {
			updated_at: string;
		};
		expect(updated_at).toMatch(ISO);
		expect(updated_at > '2000-01-01T00:00:00.000Z').toBe(true);
		expect(() =>
			t.db
				.prepare(
					"INSERT INTO user_puzzles (id, profile_id, puzzle_id, time_in_seconds) VALUES ('x','nope','z',1)"
				)
				.run()
		).toThrow(/FOREIGN KEY/);
		t.db.prepare("DELETE FROM profiles WHERE id = 'p'").run();
		expect(t.db.prepare('SELECT COUNT(*) AS n FROM user_puzzles').get()).toEqual({ n: 0 });
	});
});

describe('createDatabaseProvider', () => {
	it('reuses one connection and reopens if it was closed', () => {
		const t = createTestDatabase();
		cleanup = t.cleanup;
		const getDb = createDatabaseProvider(t.path);
		const first = getDb();
		expect(getDb()).toBe(first);
		first.close();
		const second = getDb();
		expect(second === first).toBe(false);
		expect(second.isOpen).toBe(true);
		second.close();
	});
});
