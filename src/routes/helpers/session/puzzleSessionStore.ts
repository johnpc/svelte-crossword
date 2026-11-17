import { get, writable, type Readable } from 'svelte/store';
import {
	INITIAL_SESSION,
	reducePuzzleSession,
	type PuzzleSession,
	type PuzzleSessionEvent
} from './puzzleSession';

export type SolvedSession = Extract<PuzzleSession, { phase: 'solved' }>;

export interface PuzzleSessionStore extends Readable<PuzzleSession> {
	/** The only way state changes. Returns the state after the event. */
	send(event: PuzzleSessionEvent): PuzzleSession;
	/** Current snapshot (for imperative callers such as timers). */
	current(): PuzzleSession;
}

/**
 * The one owner of a puzzle sitting's state. Components send events and
 * derive everything they render from `$session`; `onSolved` runs exactly once
 * per playing -> solved transition (that is where the completion is recorded).
 */
export function createPuzzleSession(
	onSolved?: (solved: SolvedSession) => void,
	initial: PuzzleSession = INITIAL_SESSION
): PuzzleSessionStore {
	const store = writable<PuzzleSession>(initial);
	const send = (event: PuzzleSessionEvent): PuzzleSession => {
		const before = get(store);
		const after = reducePuzzleSession(before, event);
		if (after === before) return after;
		store.set(after);
		if (before.phase === 'playing' && after.phase === 'solved') onSolved?.(after);
		return after;
	};
	return { subscribe: store.subscribe, send, current: () => get(store) };
}
