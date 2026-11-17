import createClues from './createClues.js';
import createCells from './createCells.js';
import validateClues from './validateClues.js';
import { clearCells, revealCells } from './crosswordLogic.js';

/**
 * Initialize crossword data from raw input.
 * @param {import('./types').ClueInput[]} data - Raw authored clues
 * @param {boolean} [startRevealed] - Fill every square with its answer up front
 * @returns {{ validated: boolean, clues: import('./types').Clue[], cells: import('./types').Cell[] }}
 */
export function initializeCrosswordData(data, startRevealed = false) {
	const originalClues = createClues(data);
	const validated = validateClues(originalClues);
	const clues = originalClues.map((d) => ({ ...d }));
	const built = createCells(originalClues);
	const cells = startRevealed ? revealCells(built) : built;
	return { validated, clues, cells };
}

/** Pause after the last square pops in before the reveal mode ends. */
const REVEAL_SETTLE_MS = 250;

/**
 * @typedef {object} ToolbarContext
 * @property {import('./types').Cell[]} cells
 * @property {import('./types').ToolMode} mode
 * @property {boolean} revealed - every clue already correct
 * @property {number} revealDuration
 */

/**
 * Pure toolbar reducer: maps a toolbar action onto the next tool mode (and
 * cells). Returns null when the action changes nothing. The component owns the
 * timer; it ends the reveal only if the mode is still `revealing` by then.
 * @param {'clear' | 'reveal' | 'check' | string} action
 * @param {ToolbarContext} ctx
 * @returns {import('./types').ToolbarEffect | null}
 */
export function processToolbarAction(action, ctx) {
	if (action === 'clear') {
		return { cells: clearCells(ctx.cells), mode: 'idle', resetFocus: true };
	}
	if (action === 'reveal' && !ctx.revealed) {
		return {
			cells: revealCells(ctx.cells),
			mode: 'revealing',
			resetFocus: true,
			endRevealAfterMs: ctx.revealDuration + REVEAL_SETTLE_MS
		};
	}
	if (action === 'check') return { mode: 'checking', resetFocus: false };
	return null;
}
