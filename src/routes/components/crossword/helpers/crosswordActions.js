import createClues from './createClues.js';
import createCells from './createCells.js';
import validateClues from './validateClues.js';
import { clearCells, revealCells } from './crosswordLogic.js';

/** Initialize crossword data from raw input. */
export function initializeCrosswordData(data) {
	const originalClues = createClues(data);
	const validated = validateClues(originalClues);
	const clues = originalClues.map((d) => ({ ...d }));
	const cells = createCells(originalClues);
	return { validated, clues, cells };
}

/** Process a toolbar action and apply state via callback. */
export function processToolbarAction(action, ctx, apply) {
	if (ctx.revealTimeout) clearTimeout(ctx.revealTimeout);
	if (action === 'clear') {
		apply({ cells: clearCells(ctx.cells), reset: true });
	} else if (action === 'reveal' && !ctx.revealed) {
		const t = setTimeout(ctx.endReveal, ctx.revealDuration + 250);
		apply({ cells: revealCells(ctx.cells), isRevealing: true, revealTimeout: t, reset: true });
	} else if (action === 'check') {
		apply({ isChecking: true });
	}
}
