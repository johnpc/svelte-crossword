import type { DatabaseSync } from 'node:sqlite';
import * as read from './read-queries';
import * as write from './write-queries';
import type { QueryResponse, SqlQueryEvent } from './types';

/** Returned by a handler when the payload lacks a field that query requires. */
const INVALID = Symbol('invalid-query');
type QueryHandler = (db: DatabaseSync, event: SqlQueryEvent) => unknown;

/**
 * One handler per query type. Guards mirror the original MySQL handler
 * exactly (e.g. nextPuzzle without a profileId is "Unknown query").
 */
const handlers: Record<string, QueryHandler> = {
	leaderboard: (db) => read.leaderboard(db),
	nextPuzzle: (db, e) => (e.profileId ? read.nextPuzzle(db, e.profileId) : INVALID),
	getProfile: (db, e) => (e.userId ? read.getProfile(db, e.userId) : INVALID),
	createProfile: (db, e) =>
		e.userId && e.email && e.name ? write.createProfile(db, e.userId, e.name, e.email) : INVALID,
	getUserHistory: (db, e) => (e.profileId ? read.getUserHistory(db, e.profileId) : INVALID),
	getStreakInfo: (db, e) => (e.profileId ? read.getStreakInfo(db, e.profileId) : INVALID),
	getUserPuzzle: (db, e) => (e.userPuzzleId ? read.getUserPuzzle(db, e.userPuzzleId) : INVALID),
	getPuzzle: (db, e) => (e.puzzleId ? read.getPuzzle(db, e.puzzleId) : INVALID),
	createUserPuzzle: (db, e) => (e.userPuzzle ? write.createUserPuzzle(db, e.userPuzzle) : INVALID),
	createPuzzle: (db, e) => (e.puzzle ? write.createPuzzle(db, e.puzzle) : INVALID)
};

/**
 * Dispatches one sql-queries invoke payload against SQLite. Response shapes
 * are the contract the Svelte client and the iOS/Android builds already
 * depend on, so nothing downstream changes.
 */
export function runQuery(db: DatabaseSync, event: SqlQueryEvent): QueryResponse {
	const handler = event.query ? handlers[event.query] : undefined;
	const result = handler ? handler(db, event) : INVALID;
	if (result === INVALID) return { statusCode: 400, body: 'Unknown query' };
	return { statusCode: 200, body: JSON.stringify(result) };
}
