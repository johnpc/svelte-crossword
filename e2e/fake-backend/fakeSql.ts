/**
 * In-memory stand-in for the sql-queries Lambda (amplify/function/sql-queries).
 * Same payload contract, same response shapes (`{ statusCode, body }` with a
 * JSON string body), same 0/1 booleans and ISO timestamps — only the storage
 * is a few arrays, so e2e runs need no network and no AWS account.
 */
import { FIXTURE_PUZZLES, toPuzJson, type FixturePuzzle } from './puzzles';

export type ProfileRow = { id: string; user_id: string; name: string; email: string };
export type UserPuzzleRow = {
	id: string;
	profile_id: string;
	puzzle_id: string;
	used_check: number;
	used_reveal: number;
	used_clear: number;
	time_in_seconds: number;
	created_at: string;
};
export type FakeDb = {
	profiles: ProfileRow[];
	puzzles: FixturePuzzle[];
	userPuzzles: UserPuzzleRow[];
	now: () => string;
};
export type QueryPayload = Record<string, unknown> & { query?: string };
export type QueryResponse = { statusCode: number; body: string };

export const createFakeDb = (overrides: Partial<FakeDb> = {}): FakeDb => ({
	profiles: [],
	puzzles: [...FIXTURE_PUZZLES],
	userPuzzles: [],
	now: () => new Date().toISOString(),
	...overrides
});

const byNewest = (a: { createdAt: string }, b: { createdAt: string }) =>
	b.createdAt.localeCompare(a.createdAt);
const puzzleMeta = (db: FakeDb, id: string) => db.puzzles.find((p) => p.id === id);

type Handler = (db: FakeDb, e: QueryPayload) => unknown;
const INVALID = Symbol('invalid');

const handlers: Record<string, Handler> = {
	leaderboard: (db) => ({
		users: db.profiles
			.map((p) => ({
				id: p.id,
				name: p.name,
				completedCount: db.userPuzzles.filter((u) => u.profile_id === p.id).length
			}))
			.sort((a, b) => b.completedCount - a.completedCount),
		total: db.profiles.length
	}),
	nextPuzzle: (db, e) => {
		if (!e.profileId) return INVALID;
		const played = new Set(
			db.userPuzzles.filter((u) => u.profile_id === e.profileId).map((u) => u.puzzle_id)
		);
		const next = [...db.puzzles].sort(byNewest).find((p) => !played.has(p.id));
		return next ? { id: next.id, puzJson: toPuzJson(next) } : null;
	},
	getProfile: (db, e) =>
		e.userId ? (db.profiles.find((p) => p.id === e.userId) ?? null) : INVALID,
	createProfile: (db, e) => {
		if (!e.userId || !e.email || !e.name) return INVALID;
		const row = { id: e.userId, user_id: e.userId, name: e.name, email: e.email } as ProfileRow;
		db.profiles.push(row);
		return row;
	},
	getUserHistory: (db, e) =>
		e.profileId
			? db.userPuzzles
					.filter((u) => u.profile_id === e.profileId)
					.sort((a, b) => b.created_at.localeCompare(a.created_at))
					.map((u) => ({
						...u,
						title: puzzleMeta(db, u.puzzle_id)?.title ?? null,
						author: puzzleMeta(db, u.puzzle_id)?.author ?? null
					}))
			: INVALID,
	getStreakInfo: (db, e) =>
		e.profileId
			? db.userPuzzles
					.filter((u) => u.profile_id === e.profileId)
					.sort((a, b) => b.created_at.localeCompare(a.created_at))
					.map((u) => ({ created_at: u.created_at }))
			: INVALID,
	getUserPuzzle: (db, e) =>
		e.userPuzzleId ? (db.userPuzzles.find((u) => u.id === e.userPuzzleId) ?? null) : INVALID,
	getPuzzle: (db, e) => {
		if (!e.puzzleId) return INVALID;
		const p = puzzleMeta(db, e.puzzleId as string);
		return p ? { id: p.id, puz_json: toPuzJson(p), title: p.title, author: p.author } : null;
	},
	createUserPuzzle: (db, e) => {
		const input = e.userPuzzle as Omit<UserPuzzleRow, 'created_at'> | undefined;
		if (!input) return INVALID;
		const dup = db.userPuzzles.some(
			(u) => u.profile_id === input.profile_id && u.puzzle_id === input.puzzle_id
		);
		if (dup) throw new Error('UNIQUE constraint failed: user_puzzles.profile_id, puzzle_id');
		db.userPuzzles.push({ ...input, created_at: db.now() });
		return { success: true };
	}
};

/** Mirrors runQuery(): unknown/under-specified queries are a 400 "Unknown query". */
export function runFakeQuery(db: FakeDb, payload: QueryPayload): QueryResponse {
	const handler = payload.query ? handlers[payload.query] : undefined;
	const result = handler ? handler(db, payload) : INVALID;
	if (result === INVALID) return { statusCode: 400, body: 'Unknown query' };
	return { statusCode: 200, body: JSON.stringify(result) };
}
