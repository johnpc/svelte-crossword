import { describe, it, expect } from 'vitest';
import { initializeCrosswordData, processToolbarAction } from './crosswordActions.js';

/** @type {import('./types').ClueInput[]} */
const sampleData = [
	{ clue: 'Cat', answer: 'CAT', x: 1, y: 1, direction: 'across' },
	{ clue: 'Cab', answer: 'CAB', x: 1, y: 1, direction: 'down' }
];

describe('initializeCrosswordData', () => {
	it('returns validated, clues, and cells', () => {
		const r = initializeCrosswordData(sampleData);
		expect(r.validated).toBe(true);
		expect(Array.isArray(r.clues)).toBe(true);
		expect(r.cells.every((c) => c.value === '')).toBe(true);
	});

	it('returns clues that are independent copies', () => {
		const r = initializeCrosswordData(sampleData);
		r.clues[0].mutated = true;
		const r2 = initializeCrosswordData(sampleData);
		expect(r2.clues[0].mutated).toBeUndefined();
	});

	it('starts every square filled in when startRevealed is set', () => {
		const r = initializeCrosswordData(sampleData, true);
		expect(r.cells.every((c) => c.value === c.answer)).toBe(true);
	});
});

describe('processToolbarAction', () => {
	/** @type {import('./crosswordActions.js').ToolbarContext} */
	const baseCtx = {
		cells: /** @type {import('./types').Cell[]} */ (
			/** @type {unknown} */ ([
				{ value: 'A', answer: 'A' },
				{ value: '', answer: 'B' }
			])
		),
		mode: 'idle',
		revealed: false,
		revealDuration: 100
	};

	it('"clear" empties the cells, returns to idle and re-homes focus', () => {
		const effect = processToolbarAction('clear', baseCtx);
		expect(effect?.mode).toBe('idle');
		expect(effect?.resetFocus).toBe(true);
		expect(effect?.cells?.every((c) => c.value === '')).toBe(true);
		expect(effect?.endRevealAfterMs).toBeUndefined();
	});

	it('"reveal" fills the cells, enters revealing and schedules its end', () => {
		const effect = processToolbarAction('reveal', baseCtx);
		expect(effect?.mode).toBe('revealing');
		expect(effect?.resetFocus).toBe(true);
		expect(effect?.cells?.every((c) => c.value === c.answer)).toBe(true);
		expect(effect?.endRevealAfterMs).toBe(350);
	});

	it('"reveal" is a no-op when every clue is already correct', () => {
		expect(processToolbarAction('reveal', { ...baseCtx, revealed: true })).toBeNull();
	});

	it('"check" enters checking without touching cells or focus', () => {
		expect(processToolbarAction('check', baseCtx)).toEqual({ mode: 'checking', resetFocus: false });
	});

	it('"check" during a reveal moves straight to checking (the timer is then ignored)', () => {
		expect(processToolbarAction('check', { ...baseCtx, mode: 'revealing' })?.mode).toBe('checking');
	});

	it('does nothing on an unknown action', () => {
		expect(processToolbarAction('unknown', baseCtx)).toBeNull();
	});
});
