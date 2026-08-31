import { describe, it, expect } from 'vitest';
import { dispatch } from './puzzleController.js';
import { initializeCrosswordData } from './crosswordActions.js';
import { checkClueCompletion } from './crosswordLogic.js';

/**
 * NYT-style cursor advancement specification.
 *
 * These tests encode the DESIRED cursor behavior (how the New York Times
 * crossword behaves), driven through the real engine: createClues/createCells
 * via initializeCrosswordData, then dispatch() with the same state snapshot
 * loop Puzzle.svelte uses.
 *
 * Test grid (3x3, no black squares):
 *
 *        x0  x1  x2
 *   y0    C   A   T     1A CAT  (indices 0,1,2)
 *   y1    O   R   E     4A ORE  (indices 3,4,5)
 *   y2    P   E   N     5A PEN  (indices 6,7,8)
 *
 *   1D COP (0,3,6)   2D ARE (1,4,7)   3D TEN (2,5,8)
 */

/** @type {import('./types').ClueInput[]} */
const GRID = [
	{ answer: 'CAT', clue: 'Feline', x: 0, y: 0, direction: 'across' },
	{ answer: 'ORE', clue: 'Mined rock', x: 0, y: 1, direction: 'across' },
	{ answer: 'PEN', clue: 'Writing tool', x: 0, y: 2, direction: 'across' },
	{ answer: 'COP', clue: 'Officer', x: 0, y: 0, direction: 'down' },
	{ answer: 'ARE', clue: 'To be, plural', x: 1, y: 0, direction: 'down' },
	{ answer: 'TEN', clue: 'Dime count', x: 2, y: 0, direction: 'down' }
];

/**
 * Harness that mirrors the reactive loop of Puzzle.svelte + Crossword.svelte:
 * snapshot state -> dispatch -> apply patch -> recompute derived values.
 * @param {{ isChecking?: boolean }} [opts]
 */
function createHarness(opts = {}) {
	const { clues, cells } = initializeCrosswordData(GRID);
	const state = {
		cells,
		clues: checkClueCompletion(clues, cells),
		cellsHistory: /** @type {import('./types').Cell[][]} */ ([]),
		cellsHistoryIndex: 0,
		focusedDirection: /** @type {import('./types').Direction} */ ('across'),
		focusedCellIndex: 0,
		focusedCellIndexHistory: [0],
		focusedCellIndexHistoryIndex: 0,
		isPuzzleFocused: true,
		numberOfStatesInHistory: 10,
		isChecking: !!opts.isChecking
	};

	const sorted = () =>
		[...state.cells].sort((a, b) =>
			state.focusedDirection === 'down' ? a.x - b.x || a.y - b.y : a.y - b.y || a.x - b.x
		);

	const snapshot = () => ({
		...state,
		focusedCell: state.cells[state.focusedCellIndex],
		sortedCellsInDirection: sorted()
	});

	/** @param {import('./types').PuzzleAction} action */
	const act = (action) => {
		const patch = dispatch(snapshot(), action);
		if (!patch) return;
		Object.assign(state, patch);
		state.clues = checkClueCompletion(state.clues, state.cells);
	};

	return {
		state,
		act,
		/** Type a letter at the current cursor via the keyboard path. */
		type: (/** @type {string} */ letter) => act({ type: 'keydown', detail: letter }),
		backspace: () => act({ type: 'keydown', detail: 'Backspace' }),
		/** Click a cell (first click focuses; a second click on the same cell flips direction). */
		click: (/** @type {number} */ index) => act({ type: 'focusCell', index }),
		arrow: (/** @type {import('./types').Direction} */ direction, /** @type {number} */ diff) =>
			act({ type: 'moveFocus', direction, diff }),
		/** Pre-fill cells as if loaded/typed earlier, without moving the cursor. */
		fill: (/** @type {Record<number, string>} */ values) => {
			state.cells = state.cells.map((c) =>
				values[c.index] !== undefined ? { ...c, value: values[c.index] } : c
			);
			state.clues = checkClueCompletion(state.clues, state.cells);
		},
		focus: (/** @type {number} */ index, /** @type {import('./types').Direction} */ dir) => {
			state.focusedCellIndex = index;
			if (dir) state.focusedDirection = dir;
		},
		get cursor() {
			return state.focusedCellIndex;
		},
		get direction() {
			return state.focusedDirection;
		},
		valueAt: (/** @type {number} */ index) => state.cells[index].value
	};
}

describe('cursor: typing within a word', () => {
	it('advances to the next empty cell when the word is empty', () => {
		const h = createHarness();
		h.type('C');
		expect(h.valueAt(0)).toBe('C');
		expect(h.cursor).toBe(1);
		expect(h.direction).toBe('across');
	});

	it('skips over an already-filled letter to the next empty square', () => {
		const h = createHarness();
		h.fill({ 1: 'A' }); // C _A_ T -> middle already filled
		h.focus(0, 'across');
		h.type('C');
		expect(h.cursor).toBe(2); // skips index 1, lands on the empty T square
	});

	it('typing over a filled letter advances to the next EMPTY square, not the next filled one', () => {
		const h = createHarness();
		h.fill({ 0: 'X', 1: 'A' }); // wrong letter at 0, correct at 1, empty at 2
		h.focus(0, 'across');
		h.type('C'); // fix the first letter
		expect(h.valueAt(0)).toBe('C');
		expect(h.cursor).toBe(2); // NYT skips the filled A and lands on the empty square
	});

	it('typing into the last empty square of a word jumps to the next incomplete word', () => {
		const h = createHarness();
		h.fill({ 0: 'C', 2: 'T' }); // only the middle of 1A is empty
		h.focus(1, 'across');
		h.type('A');
		expect(h.cursor).toBe(3); // first cell of 4A ORE
		expect(h.direction).toBe('across');
	});

	it('lands on the first EMPTY square of the next word, not its first square', () => {
		const h = createHarness();
		h.fill({ 0: 'C', 1: 'A', 3: 'O' }); // 1A missing only T; 4A already has its first letter
		h.focus(2, 'across');
		h.type('T');
		expect(h.cursor).toBe(4); // 4A's first empty square, skipping the pre-filled O
	});

	it('skips fully-completed words when jumping to the next word', () => {
		const h = createHarness();
		h.fill({ 0: 'C', 1: 'A', 3: 'O', 4: 'R', 5: 'E' }); // 4A completely done
		h.focus(2, 'across');
		h.type('T'); // completes 1A
		expect(h.cursor).toBe(6); // jumps past 4A to 5A PEN
	});
});

describe('cursor: word-to-word and direction transitions', () => {
	it('completing the last across word jumps to the first incomplete DOWN word', () => {
		const h = createHarness();
		// Everything filled except 4A's middle (index 4) and 5A's last (index 8).
		// 1D COP is complete via crossings; 2D ARE is incomplete (missing index 4);
		// 3D TEN is incomplete (missing index 8).
		h.fill({ 0: 'C', 1: 'A', 2: 'T', 3: 'O', 5: 'E', 6: 'P', 7: 'E' });
		h.focus(8, 'across');
		h.type('N'); // completes 5A, the last across word; 3D also completes
		// Only incomplete word left is 2D ARE. NYT jumps there, onto its empty square.
		expect(h.direction).toBe('down');
		expect(h.cursor).toBe(4);
	});

	it('when jumping into the other direction, lands on the first empty cell of that word', () => {
		const h = createHarness();
		// Everything filled except 2D's middle square (index 4).
		h.fill({ 0: 'C', 1: 'A', 2: 'T', 3: 'O', 5: 'E', 6: 'P', 7: 'E', 8: 'N' });
		h.focus(6, 'across'); // on the last across clue (5A, already complete)
		h.act({ type: 'focusClueDiff', diff: 1 }); // "next clue" wraps into down
		// Only incomplete word anywhere is 2D ARE (missing index 4).
		expect(h.direction).toBe('down');
		expect(h.cursor).toBe(4);
	});

	it('clicking the focused cell flips direction', () => {
		const h = createHarness();
		h.click(0);
		expect(h.direction).toBe('down');
		h.click(0);
		expect(h.direction).toBe('across');
	});

	it('arrow key in the cross direction flips direction without moving', () => {
		const h = createHarness();
		h.focus(0, 'across');
		h.arrow('down', 1);
		expect(h.direction).toBe('down');
		expect(h.cursor).toBe(0);
	});

	it('arrow key in the focused direction moves one cell', () => {
		const h = createHarness();
		h.focus(0, 'across');
		h.arrow('across', 1);
		expect(h.cursor).toBe(1);
	});
});

describe('cursor: backspace', () => {
	it('backspace on a filled square clears it and keeps the cursor there', () => {
		const h = createHarness();
		h.fill({ 0: 'C', 1: 'A' });
		h.focus(1, 'across');
		h.backspace();
		expect(h.valueAt(1)).toBe('');
		expect(h.cursor).toBe(1);
	});

	it('backspace on an empty square moves back and clears the previous letter', () => {
		const h = createHarness();
		h.fill({ 0: 'C' });
		h.focus(1, 'across');
		h.backspace();
		expect(h.cursor).toBe(0);
		expect(h.valueAt(0)).toBe('');
	});

	it('backspace at the first square of the grid does not move or throw', () => {
		const h = createHarness();
		h.focus(0, 'across');
		h.backspace();
		expect(h.cursor).toBe(0);
	});
});

describe('cursor: check mode locks verified-correct letters', () => {
	// Once "check" has verified a letter as correct it is locked: typing
	// advance skips it, typing on it does not overwrite it, and backspace
	// does not clear it.
	it('typing skips over checked-correct letters to the next empty square', () => {
		const h = createHarness({ isChecking: true });
		h.fill({ 0: 'X', 1: 'A' }); // 0 wrong, 1 verified correct, 2 empty
		h.focus(0, 'across');
		h.type('C');
		expect(h.cursor).toBe(2); // must skip the locked A
	});

	it('typing on a checked-correct letter does not overwrite it', () => {
		const h = createHarness({ isChecking: true });
		h.fill({ 1: 'A' }); // verified correct
		h.focus(1, 'across');
		h.type('X');
		expect(h.valueAt(1)).toBe('A');
	});

	it('backspace does not clear a checked-correct letter', () => {
		const h = createHarness({ isChecking: true });
		h.fill({ 1: 'A' }); // verified correct
		h.focus(1, 'across');
		h.backspace();
		expect(h.valueAt(1)).toBe('A');
	});
});

describe('cursor: check mode treats checked-WRONG letters as needing entry', () => {
	// Field report (SHANK bug): with check on, advancing within a word skipped
	// a square that held an incorrect letter. A checked-wrong square must be a
	// landing target — only checked-correct squares are skipped.
	it('advancing lands on a checked-wrong letter instead of skipping it', () => {
		const h = createHarness({ isChecking: true });
		h.fill({ 1: 'X' }); // middle of 1A CAT holds a wrong letter
		h.focus(0, 'across');
		h.type('C');
		expect(h.cursor).toBe(1); // must land on the wrong X, not skip to 2
	});

	it('typing over the wrong letter replaces it and advances', () => {
		const h = createHarness({ isChecking: true });
		h.fill({ 0: 'C', 1: 'X' });
		h.focus(1, 'across');
		h.type('A');
		expect(h.valueAt(1)).toBe('A');
		expect(h.cursor).toBe(2);
	});

	// Field report (ODES bug): with check on and every square filled, finishing
	// the last across word jumped to 1-Down's first letter — which was already
	// checked-correct (locked). It must jump to the first INCORRECT word and
	// land on its wrong square.
	it('finishing the last across word jumps to the first incorrect word, not a locked cell', () => {
		const h = createHarness({ isChecking: true });
		// Everything filled and correct except index 4 (middle of 4A/2D) is
		// wrong and index 8 (end of 5A/3D) is empty.
		h.fill({ 0: 'C', 1: 'A', 2: 'T', 3: 'O', 4: 'X', 5: 'E', 6: 'P', 7: 'E' });
		h.focus(8, 'across');
		h.type('N'); // completes 5A, the last across word
		// The only remaining error is the X at index 4 (in 4A and 2D).
		expect(h.cursor).toBe(4);
	});

	it('next-clue in check mode skips fully-correct words even when all are filled', () => {
		const h = createHarness({ isChecking: true });
		// All squares filled; only index 4 is wrong. 1A is fully correct.
		h.fill({ 0: 'C', 1: 'A', 2: 'T', 3: 'O', 4: 'X', 5: 'E', 6: 'P', 7: 'E', 8: 'N' });
		h.focus(0, 'across');
		h.act({ type: 'focusClueDiff', diff: 1 }); // "next clue" from 1A
		expect(h.cursor).toBe(4); // 4A is the first incorrect word; land on its X
	});
});
