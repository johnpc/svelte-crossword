import type { DatabaseSync } from 'node:sqlite';
import { toSqlParams } from '../db/params';
import { getProfile } from './read-queries';
import type { PuzzleInput, UserPuzzleInput } from './types';

export function createProfile(db: DatabaseSync, userId: string, name: string, email: string) {
	db.prepare('INSERT INTO profiles (id, user_id, name, email) VALUES (?, ?, ?, ?)').run(
		userId,
		userId,
		name,
		email
	);
	return getProfile(db, userId);
}

/** Records a completed puzzle. Duplicate (profile, puzzle) pairs reject, as under MySQL. */
export function createUserPuzzle(db: DatabaseSync, input: UserPuzzleInput) {
	const { id, profile_id, puzzle_id, used_check, used_clear, used_reveal, time_in_seconds } = input;
	db.prepare(
		`INSERT INTO user_puzzles
		 (id, profile_id, puzzle_id, used_check, used_clear, used_reveal, time_in_seconds)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`
	).run(
		...toSqlParams([
			id,
			profile_id,
			puzzle_id,
			used_check,
			used_clear,
			used_reveal,
			time_in_seconds
		])
	);
	return { success: true };
}

/** Idempotent puzzle insert (was INSERT IGNORE on MySQL). */
export function createPuzzle(db: DatabaseSync, input: PuzzleInput) {
	const { id, puz_json, puz_key, title, author } = input;
	db.prepare(
		'INSERT OR IGNORE INTO puzzles (id, puz_json, puz_key, title, author) VALUES (?, ?, ?, ?, ?)'
	).run(...toSqlParams([id, puz_json, puz_key, title, author]));
	return { success: true };
}
