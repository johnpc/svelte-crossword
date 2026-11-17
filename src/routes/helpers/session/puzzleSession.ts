import type { CrosswordClues } from '../types/types';

/** Which toolbar aids the solver leaned on; recorded with the completion. */
export type Assists = { usedCheck: boolean; usedReveal: boolean; usedClear: boolean };
export type AssistKind = 'check' | 'reveal' | 'clear';

export const NO_ASSISTS: Assists = { usedCheck: false, usedReveal: false, usedClear: false };

/**
 * @state-machine puzzle-session
 *
 * The lifecycle of one puzzle sitting. Exactly one of these shapes is ever
 * true, so "is the timer running?", "may I submit?" and "which toolbar?" are
 * all answered by `phase` alone — no booleans to keep in step.
 *
 *   loading --puzzleLoaded(puzzle)--> playing --gridSolved--> solved --nextRequested--> loading
 *   loading --puzzleLoaded(null)----> exhausted
 *   loading --loadFailed------------> error
 */
export type PuzzleSession =
	| { phase: 'loading' }
	| { phase: 'playing'; puzzle: CrosswordClues; elapsedSeconds: number; assists: Assists }
	| { phase: 'solved'; puzzle: CrosswordClues; elapsedSeconds: number; assists: Assists }
	| { phase: 'exhausted' }
	| { phase: 'error'; message: string };

/** A sitting with a puzzle on screen (the two phases that render a grid). */
export type ActiveSession = Extract<PuzzleSession, { phase: 'playing' | 'solved' }>;

export type PuzzleSessionEvent =
	| { type: 'puzzleLoaded'; puzzle: CrosswordClues | null }
	| { type: 'loadFailed'; message: string }
	| { type: 'tick' }
	| { type: 'assistUsed'; assist: AssistKind }
	| { type: 'gridSolved' }
	| { type: 'nextRequested' }
	| { type: 'reset' };

export const INITIAL_SESSION: PuzzleSession = { phase: 'loading' };

const ASSIST_FLAG: Record<AssistKind, keyof Assists> = {
	check: 'usedCheck',
	reveal: 'usedReveal',
	clear: 'usedClear'
};

type Playing = Extract<PuzzleSession, { phase: 'playing' }>;
type Transition<K extends PuzzleSessionEvent['type']> = (
	state: PuzzleSession,
	event: Extract<PuzzleSessionEvent, { type: K }>
) => PuzzleSession;

/** Lifts a playing-only transition; in every other phase the event is ignored. */
const whilePlaying =
	<K extends PuzzleSessionEvent['type']>(
		step: (state: Playing, event: Extract<PuzzleSessionEvent, { type: K }>) => PuzzleSession
	): Transition<K> =>
	(state, event) =>
		state.phase === 'playing' ? step(state, event) : state;

const TRANSITIONS: { [K in PuzzleSessionEvent['type']]: Transition<K> } = {
	reset: () => INITIAL_SESSION,
	nextRequested: (state) => (state.phase === 'solved' ? INITIAL_SESSION : state),
	puzzleLoaded: (state, { puzzle }) => {
		if (state.phase !== 'loading') return state;
		if (!puzzle) return { phase: 'exhausted' };
		return { phase: 'playing', puzzle, elapsedSeconds: 0, assists: NO_ASSISTS };
	},
	loadFailed: (state, { message }) =>
		state.phase === 'loading' ? { phase: 'error', message } : state,
	tick: whilePlaying((state) => ({ ...state, elapsedSeconds: state.elapsedSeconds + 1 })),
	assistUsed: whilePlaying((state, { assist }) => ({
		...state,
		assists: { ...state.assists, [ASSIST_FLAG[assist]]: true }
	})),
	gridSolved: whilePlaying((state) => ({ ...state, phase: 'solved' }))
};

/**
 * Pure, total transition function. Events that do not apply in the current
 * phase return the same state object, so a late `gridSolved` from a grid that
 * is being torn down, or a `tick` after solving, can never corrupt anything.
 */
export function reducePuzzleSession(
	state: PuzzleSession,
	event: PuzzleSessionEvent
): PuzzleSession {
	const transition = TRANSITIONS[event.type] as Transition<typeof event.type>;
	return transition(state, event);
}
