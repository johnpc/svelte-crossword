import type { DatabaseSync } from 'node:sqlite';
import { isValidPuzzle } from './puzzle-validator';

type Row = Record<string, unknown>;

const PROFILE_COLUMNS = 'id, user_id, name, email';
const USER_PUZZLE_COLUMNS =
	'id, profile_id, puzzle_id, used_check, used_reveal, used_clear, time_in_seconds, created_at';

const firstOrNull = (rows: unknown[]): unknown => (rows.length > 0 ? rows[0] : null);

/** Public leaderboard: display names only (emails are PII and never ship here). */
export function leaderboard(db: DatabaseSync) {
	const users = db
		.prepare(
			`SELECT p.id, p.name, COUNT(up.id) AS completedCount
			 FROM profiles p
			 LEFT JOIN user_puzzles up ON p.id = up.profile_id
			 GROUP BY p.id, p.name
			 ORDER BY completedCount DESC
			 LIMIT 100`
		)
		.all();
	const total = db.prepare('SELECT COUNT(*) AS total FROM profiles').get() as { total: number };
	return { users, total: total.total };
}

/**
 * Newest unplayed puzzle for a profile, skipping corrupt rows (all-black or
 * clueless puzzles) so every client is guarded without a release.
 */
export function nextPuzzle(db: DatabaseSync, profileId: string) {
	const candidates = db
		.prepare(
			`SELECT p.id, p.puz_json AS puzJson
			 FROM puzzles p
			 LEFT JOIN user_puzzles up ON p.id = up.puzzle_id AND up.profile_id = ?
			 WHERE up.id IS NULL
			 ORDER BY p.created_at DESC
			 LIMIT 10`
		)
		.all(profileId) as { id: string; puzJson: string }[];
	const valid = candidates.find((row) => isValidPuzzle(row.puzJson));
	return valid ? { id: valid.id, puzJson: JSON.parse(valid.puzJson) } : null;
}

export function getProfile(db: DatabaseSync, id: string) {
	return firstOrNull(db.prepare(`SELECT ${PROFILE_COLUMNS} FROM profiles WHERE id = ?`).all(id));
}

export function getUserHistory(db: DatabaseSync, profileId: string) {
	return db
		.prepare(
			`SELECT up.id, up.profile_id, up.puzzle_id, up.used_check, up.used_reveal, up.used_clear,
			        up.time_in_seconds, up.created_at, p.title, p.author
			 FROM user_puzzles up
			 LEFT JOIN puzzles p ON up.puzzle_id = p.id
			 WHERE up.profile_id = ?
			 ORDER BY up.created_at DESC`
		)
		.all(profileId);
}

export function getStreakInfo(db: DatabaseSync, profileId: string) {
	return db
		.prepare('SELECT created_at FROM user_puzzles WHERE profile_id = ? ORDER BY created_at DESC')
		.all(profileId);
}

export function getUserPuzzle(db: DatabaseSync, userPuzzleId: string) {
	return firstOrNull(
		db.prepare(`SELECT ${USER_PUZZLE_COLUMNS} FROM user_puzzles WHERE id = ?`).all(userPuzzleId)
	);
}

/** Puzzle row with puz_json decoded once (legacy rows may still be double-encoded). */
export function getPuzzle(db: DatabaseSync, puzzleId: string) {
	const row = firstOrNull(
		db.prepare('SELECT id, puz_json, title, author FROM puzzles WHERE id = ?').all(puzzleId)
	) as Row | null;
	if (row && typeof row.puz_json === 'string') row.puz_json = JSON.parse(row.puz_json);
	return row;
}
