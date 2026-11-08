// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestDatabase } from '../db/test-db';
import { runQuery } from './run-query';
import { aiPuzzle, legacyPuzzle, PROFILE, OTHER_PROFILE, seedFixtures } from './test-fixtures';
import type { SqlQueryEvent } from './types';

let t: ReturnType<typeof createTestDatabase>;
beforeEach(() => {
	t = createTestDatabase();
	seedFixtures(t.db);
});
afterEach(() => t.cleanup());

const run = (event: SqlQueryEvent) => {
	const res = runQuery(t.db, event);
	expect(res.statusCode).toBe(200);
	return JSON.parse(res.body);
};

describe('runQuery (SQLite) matches the MySQL contract', () => {
	it('leaderboard: names + completedCount, no emails, plus total', () => {
		expect(run({ query: 'leaderboard' })).toEqual({
			users: [
				{ id: 'user-1', name: 'Ada', completedCount: 2 },
				{ id: 'user-2', name: 'Bob', completedCount: 0 }
			],
			total: 2
		});
	});

	it('nextPuzzle: newest unplayed valid puzzle, corrupt rows skipped, puzJson decoded', () => {
		// black-1 is newest but invalid; ai-2 is played; ai-1 is next.
		expect(run({ query: 'nextPuzzle', profileId: PROFILE.id })).toEqual({
			id: 'ai-1',
			puzJson: aiPuzzle
		});
		// Legacy rows are double-encoded: one decode yields the inner JSON string.
		const bob = run({ query: 'nextPuzzle', profileId: OTHER_PROFILE.id });
		expect(bob.id).toBe('ai-2');
		t.db.exec("DELETE FROM puzzles WHERE id IN ('ai-1','ai-2','black-1')");
		expect(run({ query: 'nextPuzzle', profileId: OTHER_PROFILE.id })).toEqual({
			id: 'legacy-1',
			puzJson: JSON.stringify(legacyPuzzle)
		});
	});

	it('nextPuzzle: null when nothing valid is left', () => {
		t.db.exec("DELETE FROM puzzles WHERE id != 'black-1'");
		expect(run({ query: 'nextPuzzle', profileId: PROFILE.id })).toBeNull();
	});

	it('getProfile: row or null', () => {
		expect(run({ query: 'getProfile', userId: PROFILE.id })).toEqual(PROFILE);
		expect(run({ query: 'getProfile', userId: 'missing' })).toBeNull();
	});

	it('createProfile: inserts and returns the new row', () => {
		const created = run({
			query: 'createProfile',
			userId: 'user-3',
			email: 'c@example.com',
			name: 'Cy'
		});
		expect(created).toEqual({
			id: 'user-3',
			user_id: 'user-3',
			name: 'Cy',
			email: 'c@example.com'
		});
		expect(() =>
			runQuery(t.db, {
				query: 'createProfile',
				userId: 'user-3',
				email: 'c@example.com',
				name: 'Cy'
			})
		).toThrow(/UNIQUE/);
	});

	it('getUserHistory: newest first with 0/1 flags, ISO created_at, joined title/author', () => {
		const rows = run({ query: 'getUserHistory', profileId: PROFILE.id });
		expect(rows).toEqual([
			{
				id: 'up-2',
				profile_id: 'user-1',
				puzzle_id: 'legacy-1',
				used_check: 0,
				used_reveal: 1,
				used_clear: 0,
				time_in_seconds: 200,
				created_at: '2026-02-17T10:00:00.000Z',
				title: null,
				author: null
			},
			{
				id: 'up-1',
				profile_id: 'user-1',
				puzzle_id: 'ai-2',
				used_check: 1,
				used_reveal: 0,
				used_clear: 0,
				time_in_seconds: 95,
				created_at: '2026-02-16T10:00:00.000Z',
				title: 'Themed',
				author: 'xwords robot'
			}
		]);
		expect(run({ query: 'getUserHistory', profileId: OTHER_PROFILE.id })).toEqual([]);
	});

	it('getStreakInfo: created_at list newest first', () => {
		expect(run({ query: 'getStreakInfo', profileId: PROFILE.id })).toEqual([
			{ created_at: '2026-02-17T10:00:00.000Z' },
			{ created_at: '2026-02-16T10:00:00.000Z' }
		]);
	});

	it('getUserPuzzle: single row or null', () => {
		expect(run({ query: 'getUserPuzzle', userPuzzleId: 'up-1' })).toEqual({
			id: 'up-1',
			profile_id: 'user-1',
			puzzle_id: 'ai-2',
			used_check: 1,
			used_reveal: 0,
			used_clear: 0,
			time_in_seconds: 95,
			created_at: '2026-02-16T10:00:00.000Z'
		});
		expect(run({ query: 'getUserPuzzle', userPuzzleId: 'nope' })).toBeNull();
	});

	it('getPuzzle: puz_json decoded exactly once', () => {
		expect(run({ query: 'getPuzzle', puzzleId: 'ai-1' })).toEqual({
			id: 'ai-1',
			puz_json: aiPuzzle,
			title: 'Themed',
			author: 'xwords robot'
		});
		expect(run({ query: 'getPuzzle', puzzleId: 'legacy-1' }).puz_json).toBe(
			JSON.stringify(legacyPuzzle)
		);
		expect(run({ query: 'getPuzzle', puzzleId: 'nope' })).toBeNull();
	});

	it('createUserPuzzle: inserts with defaults and rejects duplicates / unknown puzzles', () => {
		const userPuzzle = {
			id: 'up-3',
			profile_id: PROFILE.id,
			puzzle_id: 'ai-1',
			used_check: 0,
			used_clear: 1,
			used_reveal: 0,
			time_in_seconds: 42
		};
		expect(run({ query: 'createUserPuzzle', userPuzzle })).toEqual({ success: true });
		const saved = run({ query: 'getUserPuzzle', userPuzzleId: 'up-3' });
		expect(saved).toMatchObject({
			used_check: 0,
			used_clear: 1,
			used_reveal: 0,
			time_in_seconds: 42
		});
		expect(saved.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/);
		expect(() => runQuery(t.db, { query: 'createUserPuzzle', userPuzzle })).toThrow(/UNIQUE/);
		expect(() =>
			runQuery(t.db, {
				query: 'createUserPuzzle',
				userPuzzle: { ...userPuzzle, id: 'up-4', puzzle_id: 'ghost' }
			})
		).toThrow(/FOREIGN KEY/);
	});

	it('createPuzzle: idempotent insert', () => {
		const puzzle = {
			id: 'ai-9',
			puz_json: JSON.stringify(aiPuzzle),
			puz_key: 'ai-9',
			title: 'T',
			author: 'A'
		};
		expect(run({ query: 'createPuzzle', puzzle })).toEqual({ success: true });
		expect(run({ query: 'createPuzzle', puzzle: { ...puzzle, title: 'changed' } })).toEqual({
			success: true
		});
		expect(run({ query: 'getPuzzle', puzzleId: 'ai-9' })).toMatchObject({ title: 'T' });
	});

	it('returns 400 for unknown queries and missing required fields', () => {
		for (const event of [
			{},
			{ query: 'nope' },
			{ query: 'nextPuzzle' },
			{ query: 'getProfile' },
			{ query: 'createProfile', userId: 'u', email: 'e' },
			{ query: 'getUserHistory' },
			{ query: 'getStreakInfo' },
			{ query: 'getUserPuzzle' },
			{ query: 'getPuzzle' },
			{ query: 'createUserPuzzle' },
			{ query: 'createPuzzle' }
		] as SqlQueryEvent[]) {
			expect(runQuery(t.db, event)).toEqual({ statusCode: 400, body: 'Unknown query' });
		}
	});
});
