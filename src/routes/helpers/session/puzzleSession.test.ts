import { describe, it, expect } from 'vitest';
import {
	INITIAL_SESSION,
	NO_ASSISTS,
	reducePuzzleSession,
	type PuzzleSession,
	type PuzzleSessionEvent
} from './puzzleSession';

const puzzle = { id: 'p-1', clues: [], title: 'T', author: 'A' };
const run = (events: PuzzleSessionEvent[], from: PuzzleSession = INITIAL_SESSION) =>
	events.reduce(reducePuzzleSession, from);

const playing = run([{ type: 'puzzleLoaded', puzzle }]);
const solved = run([{ type: 'gridSolved' }], playing);

describe('reducePuzzleSession', () => {
	it('starts loading and enters playing with a fresh clock and no assists', () => {
		expect(INITIAL_SESSION).toEqual({ phase: 'loading' });
		expect(playing).toEqual({ phase: 'playing', puzzle, elapsedSeconds: 0, assists: NO_ASSISTS });
	});

	it('a null puzzle means the catalogue is exhausted', () => {
		expect(run([{ type: 'puzzleLoaded', puzzle: null }])).toEqual({ phase: 'exhausted' });
	});

	it('a load failure is an error phase carrying the message', () => {
		expect(run([{ type: 'loadFailed', message: 'boom' }])).toEqual({
			phase: 'error',
			message: 'boom'
		});
	});

	it('only the loading phase accepts load results', () => {
		expect(run([{ type: 'puzzleLoaded', puzzle: null }], playing)).toBe(playing);
		expect(run([{ type: 'loadFailed', message: 'x' }], solved)).toBe(solved);
	});

	it('ticks advance the clock only while playing', () => {
		expect(run([{ type: 'tick' }, { type: 'tick' }], playing)).toMatchObject({ elapsedSeconds: 2 });
		expect(run([{ type: 'tick' }], solved)).toBe(solved);
		expect(run([{ type: 'tick' }])).toBe(INITIAL_SESSION);
	});

	it('records each assist kind while playing and ignores them afterwards', () => {
		const s = run(
			[
				{ type: 'assistUsed', assist: 'check' },
				{ type: 'assistUsed', assist: 'reveal' }
			],
			playing
		);
		expect(s).toMatchObject({ assists: { usedCheck: true, usedReveal: true, usedClear: false } });
		expect(run([{ type: 'assistUsed', assist: 'clear' }], s)).toMatchObject({
			assists: { usedClear: true }
		});
		expect(run([{ type: 'assistUsed', assist: 'clear' }], solved)).toBe(solved);
	});

	it('gridSolved moves playing to solved once, keeping clock and assists', () => {
		const timed = run([{ type: 'tick' }, { type: 'assistUsed', assist: 'check' }], playing);
		const done = run([{ type: 'gridSolved' }], timed);
		expect(done).toEqual({ ...timed, phase: 'solved' });
		expect(run([{ type: 'gridSolved' }], done)).toBe(done);
		expect(run([{ type: 'gridSolved' }])).toBe(INITIAL_SESSION);
	});

	it('nextRequested leaves solved for loading and is inert elsewhere', () => {
		expect(run([{ type: 'nextRequested' }], solved)).toEqual({ phase: 'loading' });
		expect(run([{ type: 'nextRequested' }], playing)).toBe(playing);
	});

	it('reset returns to loading from any phase', () => {
		for (const s of [playing, solved, run([{ type: 'puzzleLoaded', puzzle: null }])]) {
			expect(run([{ type: 'reset' }], s)).toEqual({ phase: 'loading' });
		}
	});
});
