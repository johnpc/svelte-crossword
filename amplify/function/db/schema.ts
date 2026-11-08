/**
 * SQLite schema for the crossword database. Mirrors scripts/setup-sql-database.sql
 * (the retired MySQL schema) with these translations:
 *   - VARCHAR/TEXT -> TEXT, BOOLEAN/INT -> INTEGER (mysql2 already returned
 *     BOOLEAN columns as 0/1, so the wire shape is unchanged).
 *   - TIMESTAMP DEFAULT CURRENT_TIMESTAMP -> an ISO-8601 UTC string default, so
 *     created_at serialises exactly like the JS Date mysql2 used to return
 *     (e.g. "2026-01-02T03:04:05.000Z") and sorts correctly as text.
 *   - ON UPDATE CURRENT_TIMESTAMP -> AFTER UPDATE triggers.
 * Every statement is idempotent so the schema can be applied on each open.
 */
export const ISO_NOW = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";

const timestamps = `
  created_at TEXT NOT NULL DEFAULT (${ISO_NOW}),
  updated_at TEXT NOT NULL DEFAULT (${ISO_NOW})`;

const touchTrigger = (table: string) => `
CREATE TRIGGER IF NOT EXISTS trg_${table}_updated_at
AFTER UPDATE ON ${table} FOR EACH ROW
BEGIN
  UPDATE ${table} SET updated_at = ${ISO_NOW} WHERE id = NEW.id;
END`;

export const SCHEMA_STATEMENTS: readonly string[] = [
	`CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,${timestamps}
)`,
	`CREATE TABLE IF NOT EXISTS puzzles (
  id TEXT PRIMARY KEY,
  puz_json TEXT NOT NULL,
  puz_key TEXT,
  title TEXT,
  author TEXT,${timestamps}
)`,
	`CREATE INDEX IF NOT EXISTS idx_puzzles_created_at ON puzzles (created_at)`,
	`CREATE TABLE IF NOT EXISTS user_puzzles (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  puzzle_id TEXT NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  used_check INTEGER NOT NULL DEFAULT 0,
  used_reveal INTEGER NOT NULL DEFAULT 0,
  used_clear INTEGER NOT NULL DEFAULT 0,
  time_in_seconds INTEGER NOT NULL,${timestamps},
  UNIQUE (profile_id, puzzle_id)
)`,
	`CREATE INDEX IF NOT EXISTS idx_user_puzzles_profile_created ON user_puzzles (profile_id, created_at)`,
	`CREATE INDEX IF NOT EXISTS idx_user_puzzles_created_at ON user_puzzles (created_at)`,
	touchTrigger('profiles'),
	touchTrigger('puzzles'),
	touchTrigger('user_puzzles')
];
