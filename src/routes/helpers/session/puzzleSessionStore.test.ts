import { describe, it, expect, vi } from 'vitest';
import { get } from 'svelte/store';
import { createPuzzleSession } from './puzzleSessionStore';

const puzzle = { id: 'p-1', clues: [], title: 'T', author: 'A' };

describe('createPuzzleSession', () => {
	it('starts loading and exposes the reduced state through subscribe/current', () => {
		const session = createPuzzleSession();
		expect(get(session)).toEqual({ phase: 'loading' });
		session.send({ type: 'puzzleLoaded', puzzle });
		expect(get(session).phase).toBe('playing');
		expect(session.current()).toBe(get(session));
	});

	it('accepts a non-default initial state', () => {
		const session = createPuzzleSession(undefined, { phase: 'exhausted' });
		expect(session.current()).toEqual({ phase: 'exhausted' });
	});

	it('fires onSolved exactly once, with the solved snapshot', () => {
		const onSolved = vi.fn();
		const session = createPuzzleSession(onSolved);
		session.send({ type: 'puzzleLoaded', puzzle });
		session.send({ type: 'tick' });
		session.send({ type: 'assistUsed', assist: 'reveal' });
		session.send({ type: 'gridSolved' });
		session.send({ type: 'gridSolved' });
		expect(onSolved).toHaveBeenCalledOnce();
		expect(onSolved).toHaveBeenCalledWith({
			phase: 'solved',
			puzzle,
			elapsedSeconds: 1,
			assists: { usedCheck: false, usedReveal: true, usedClear: false }
		});
	});

	it('does not notify subscribers for events that change nothing', () => {
		const session = createPuzzleSession();
		const seen = vi.fn();
		const unsubscribe = session.subscribe(seen);
		session.send({ type: 'tick' });
		session.send({ type: 'gridSolved' });
		expect(seen).toHaveBeenCalledOnce(); // the initial value only
		unsubscribe();
	});
});
