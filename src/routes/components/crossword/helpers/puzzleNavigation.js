import getCellAfterDiff from './getCellAfterDiff.js';
import { needsEntry } from './cellNavigation.js';

// Cell-level stepping lives in cellNavigation.js; re-exported here so
// existing imports keep working.
export { isLockedCell, getNextCellInDirection, getFlippedDirection } from './cellNavigation.js';

/**
 * A clue needs no further work: every square filled — or, in check mode,
 * every square verified correct (a wrong letter still needs fixing).
 * @param {import('./types').Clue} clue
 * @param {boolean} [isChecking]
 * @returns {boolean}
 */
const isClueDone = (clue, isChecking) => (isChecking ? !!clue.isCorrect : !!clue.isFilled);

/**
 * @param {import('./types').Clue[]} clues
 * @param {import('./types').Direction} focusedDirection
 * @param {number | undefined} currentNumber
 * @param {boolean} allDone
 * @param {number} diff
 * @param {boolean} [isChecking]
 * @returns {import('./types').Clue[]}
 */
function findCandidateClues(clues, focusedDirection, currentNumber, allDone, diff, isChecking) {
	// Coerce a missing clue number to NaN so the relational comparisons below
	// evaluate to false (matching the prior `> undefined` / `< undefined` behavior).
	const cn = currentNumber ?? NaN;
	let candidates = clues.filter(
		(clue) =>
			(allDone || !isClueDone(clue, isChecking)) &&
			(diff > 0 ? clue.number > cn : clue.number < cn) &&
			clue.direction === focusedDirection
	);
	if (diff < 0) candidates = candidates.reverse();
	return candidates;
}

/**
 * @param {import('./types').Clue[]} candidates
 * @param {number} diff
 * @param {import('./types').Clue[]} clues
 * @param {import('./types').Direction} focusedDirection
 * @param {boolean} [isChecking]
 * @returns {{ clue: import('./types').Clue | undefined, direction: import('./types').Direction }}
 */
function resolveNextClue(candidates, diff, clues, focusedDirection, isChecking) {
	const nextClue = candidates[Math.abs(diff) - 1];
	if (nextClue) return { clue: nextClue, direction: focusedDirection };
	// Wrap into the other direction, preferring its first not-done clue.
	const newDirection = focusedDirection === 'across' ? 'down' : 'across';
	const wrapped = clues.filter((c) => c.direction === newDirection);
	return {
		clue: wrapped.find((c) => !isClueDone(c, isChecking)) || wrapped[0],
		direction: newDirection
	};
}

/**
 * @param {import('./types').Cell[]} sortedCells
 * @param {number | undefined} clueNumber
 * @param {import('./types').Direction} focusedDirection
 * @param {boolean} allDone
 * @param {boolean} [isChecking]
 * @returns {Partial<import('./types').Cell>}
 */
function findCellForClue(sortedCells, clueNumber, focusedDirection, allDone, isChecking) {
	const inClue = (/** @type {import('./types').Cell} */ cell) =>
		cell.clueNumbers[focusedDirection] === clueNumber;
	return (
		sortedCells.find((cell) => inClue(cell) && (needsEntry(cell, isChecking) || allDone)) ||
		sortedCells.find(inClue) ||
		{}
	);
}

/**
 * @param {{
 *   clues: import('./types').Clue[],
 *   focusedCell: import('./types').Cell,
 *   focusedDirection: import('./types').Direction,
 *   sortedCellsInDirection: import('./types').Cell[],
 *   diff?: number,
 *   cells?: import('./types').Cell[],
 *   isChecking?: boolean
 * }} params
 * @returns {{ focusedCellIndex: number, focusedDirection: import('./types').Direction }}
 */
export function getNextClueCell({
	clues,
	focusedCell,
	focusedDirection,
	sortedCellsInDirection,
	diff = 1,
	isChecking = false
}) {
	const currentNumber = focusedCell.clueNumbers[focusedDirection];
	const allDone = clues
		.filter((c) => c.direction === focusedDirection)
		.every((c) => isClueDone(c, isChecking));
	const candidates = findCandidateClues(
		clues,
		focusedDirection,
		currentNumber,
		allDone,
		diff,
		isChecking
	);
	const { clue: nextClue, direction: newDirection } = resolveNextClue(
		candidates,
		diff,
		clues,
		focusedDirection,
		isChecking
	);
	// Resolve the landing cell against the direction the clue belongs to (it
	// may differ from focusedDirection after wrapping across<->down). After a
	// wrap, allDone described the old direction, so prefer needs-entry cells.
	const nextCell = findCellForClue(
		sortedCellsInDirection,
		nextClue?.number,
		newDirection,
		allDone && newDirection === focusedDirection,
		isChecking
	);
	return { focusedCellIndex: nextCell.index ?? 0, focusedDirection: newDirection };
}

/**
 * @param {{
 *   direction: import('./types').Direction,
 *   diff: number,
 *   cells: import('./types').Cell[],
 *   focusedDirection: import('./types').Direction,
 *   focusedCell: import('./types').Cell
 * }} params
 * @returns {{ focusedDirection: import('./types').Direction } | { focusedCellIndex: number } | null}
 */
export function getMoveFocusResult({ direction, diff, cells, focusedDirection, focusedCell }) {
	if (focusedDirection !== direction) return { focusedDirection: direction };
	const nextCell = getCellAfterDiff({ diff, cells, direction, focusedCell });
	if (!nextCell) return null;
	return { focusedCellIndex: nextCell.index };
}
