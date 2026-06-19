import { describe, it, expect, vi } from 'vitest';
import { initializeCrosswordData, processToolbarAction } from './crosswordActions.js';

/** @type {import('./types').ClueInput[]} */
const sampleData = [
	{ clue: 'Cat', answer: 'CAT', x: 1, y: 1, direction: 'across' },
	{ clue: 'Cab', answer: 'CAB', x: 1, y: 1, direction: 'down' }
];

describe('initializeCrosswordData', () => {
	it('returns validated, clues, and cells', () => {
		const r = initializeCrosswordData(sampleData);
		expect(r).toHaveProperty('validated');
		expect(r).toHaveProperty('clues');
		expect(r).toHaveProperty('cells');
		expect(Array.isArray(r.clues)).toBe(true);
		expect(Array.isArray(r.cells)).toBe(true);
	});

	it('returns clues that are independent copies', () => {
		const r = initializeCrosswordData(sampleData);
		r.clues[0].mutated = true;
		const r2 = initializeCrosswordData(sampleData);
		expect(r2.clues[0].mutated).toBeUndefined();
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
		revealed: false,
		revealTimeout: undefined,
		revealDuration: 100,
		endReveal: () => {}
	};

	it('clears cells on "clear" action', () => {
		const apply = vi.fn();
		processToolbarAction('clear', baseCtx, apply);
		expect(apply).toHaveBeenCalledTimes(1);
		const arg = apply.mock.calls[0][0];
		expect(arg.cells).toBeDefined();
		expect(arg.reset).toBe(true);
	});

	it('reveals cells on "reveal" action', () => {
		const apply = vi.fn();
		processToolbarAction('reveal', baseCtx, apply);
		expect(apply).toHaveBeenCalled();
		const arg = apply.mock.calls[0][0];
		expect(arg.cells).toBeDefined();
		expect(arg.isRevealing).toBe(true);
		expect(arg.revealTimeout).toBeDefined();
		expect(arg.reset).toBe(true);
	});

	it('does not reveal when already revealed', () => {
		const apply = vi.fn();
		processToolbarAction('reveal', { ...baseCtx, revealed: true }, apply);
		expect(apply).not.toHaveBeenCalled();
	});

	it('checks cells on "check" action', () => {
		const apply = vi.fn();
		processToolbarAction('check', baseCtx, apply);
		expect(apply).toHaveBeenCalledWith({ isChecking: true });
	});

	it('does nothing on unknown action', () => {
		const apply = vi.fn();
		processToolbarAction('unknown', baseCtx, apply);
		expect(apply).not.toHaveBeenCalled();
	});

	it('clears existing revealTimeout', () => {
		const oldTimeout = setTimeout(() => {}, 1000);
		const apply = vi.fn();
		processToolbarAction('clear', { ...baseCtx, revealTimeout: oldTimeout }, apply);
		expect(apply).toHaveBeenCalled();
		clearTimeout(oldTimeout);
	});
});
