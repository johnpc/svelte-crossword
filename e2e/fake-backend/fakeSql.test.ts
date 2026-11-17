import { describe, it, expect } from 'vitest';
import { createFakeDb, runFakeQuery } from './fakeSql';
import { PREVIEW_MINI, WORD_SQUARE, toPuzJson } from './puzzles';

const ada = { id: 'u-ada', user_id: 'u-ada', name: 'ada@example.com', email: 'ada@example.com' };
const parse = (r: { statusCode: number; body: string }) => JSON.parse(r.body);
const seeded = () => createFakeDb({ profiles: [ada], now: () => '2026-03-03T10:00:00.000Z' });

describe('runFakeQuery', () => {
	it('rejects unknown and under-specified queries like the real handler', () => {
		expect(runFakeQuery(seeded(), { query: 'nope' })).toEqual({
			statusCode: 400,
			body: 'Unknown query'
		});
		expect(runFakeQuery(seeded(), { query: 'nextPuzzle' }).statusCode).toBe(400);
		expect(runFakeQuery(seeded(), {}).statusCode).toBe(400);
	});

	it('serves the newest unplayed puzzle, then the next, then null', () => {
		const db = seeded();
		const first = parse(runFakeQuery(db, { query: 'nextPuzzle', profileId: ada.id }));
		expect(first).toEqual({ id: PREVIEW_MINI.id, puzJson: toPuzJson(PREVIEW_MINI) });
		runFakeQuery(db, {
			query: 'createUserPuzzle',
			userPuzzle: {
				id: 'up-1',
				profile_id: ada.id,
				puzzle_id: PREVIEW_MINI.id,
				used_check: 0,
				used_reveal: 0,
				used_clear: 0,
				time_in_seconds: 12
			}
		});
		expect(parse(runFakeQuery(db, { query: 'nextPuzzle', profileId: ada.id })).id).toBe(
			WORD_SQUARE.id
		);
		runFakeQuery(db, {
			query: 'createUserPuzzle',
			userPuzzle: { id: 'up-2', profile_id: ada.id, puzzle_id: WORD_SQUARE.id, time_in_seconds: 5 }
		});
		expect(parse(runFakeQuery(db, { query: 'nextPuzzle', profileId: ada.id }))).toBeNull();
	});

	it('puz_json carries clue coordinates the client reads back', () => {
		const puz = toPuzJson(WORD_SQUARE);
		expect(Object.values(puz.clues.across)).toHaveLength(3);
		expect(puz.clues.down['2']).toMatchObject({ answer: 'ARE', x: 1, y: 0, direction: 'down' });
	});

	it('profiles: get returns null until created, then the row', () => {
		const db = createFakeDb();
		expect(parse(runFakeQuery(db, { query: 'getProfile', userId: 'u-1' }))).toBeNull();
		const created = parse(
			runFakeQuery(db, { query: 'createProfile', userId: 'u-1', email: 'a@b.c', name: 'A' })
		);
		expect(created).toEqual({ id: 'u-1', user_id: 'u-1', name: 'A', email: 'a@b.c' });
		expect(parse(runFakeQuery(db, { query: 'getProfile', userId: 'u-1' }))).toEqual(created);
	});

	it('records completions with the db clock and rejects duplicates', () => {
		const db = seeded();
		const userPuzzle = {
			id: 'up-1',
			profile_id: ada.id,
			puzzle_id: WORD_SQUARE.id,
			time_in_seconds: 9
		};
		expect(parse(runFakeQuery(db, { query: 'createUserPuzzle', userPuzzle }))).toEqual({
			success: true
		});
		expect(db.userPuzzles[0].created_at).toBe('2026-03-03T10:00:00.000Z');
		expect(() => runFakeQuery(db, { query: 'createUserPuzzle', userPuzzle })).toThrow(/UNIQUE/);
	});

	it('history, streak, user puzzle and puzzle lookups read back what was recorded', () => {
		const db = seeded();
		const userPuzzle = {
			id: 'up-1',
			profile_id: ada.id,
			puzzle_id: WORD_SQUARE.id,
			used_check: 1,
			used_reveal: 0,
			used_clear: 0,
			time_in_seconds: 9
		};
		runFakeQuery(db, { query: 'createUserPuzzle', userPuzzle });
		expect(parse(runFakeQuery(db, { query: 'getUserHistory', profileId: ada.id }))).toEqual([
			{
				...userPuzzle,
				created_at: '2026-03-03T10:00:00.000Z',
				title: 'Word Square',
				author: 'Fixture Author'
			}
		]);
		expect(parse(runFakeQuery(db, { query: 'getStreakInfo', profileId: ada.id }))).toEqual([
			{ created_at: '2026-03-03T10:00:00.000Z' }
		]);
		expect(parse(runFakeQuery(db, { query: 'getUserPuzzle', userPuzzleId: 'up-1' }))).toMatchObject(
			userPuzzle
		);
		expect(parse(runFakeQuery(db, { query: 'getPuzzle', puzzleId: WORD_SQUARE.id }))).toMatchObject(
			{
				id: WORD_SQUARE.id,
				title: 'Word Square',
				puz_json: toPuzJson(WORD_SQUARE)
			}
		);
		expect(parse(runFakeQuery(db, { query: 'getPuzzle', puzzleId: 'missing' }))).toBeNull();
	});

	it('leaderboard counts completions per profile and the total number of profiles', () => {
		const db = seeded();
		runFakeQuery(db, {
			query: 'createUserPuzzle',
			userPuzzle: { id: 'up-1', profile_id: ada.id, puzzle_id: WORD_SQUARE.id, time_in_seconds: 9 }
		});
		expect(parse(runFakeQuery(db, { query: 'leaderboard' }))).toEqual({
			users: [{ id: ada.id, name: ada.email, completedCount: 1 }],
			total: 1
		});
	});
});
