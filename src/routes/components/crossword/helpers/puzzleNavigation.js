import getCellAfterDiff from './getCellAfterDiff.js';

// Cell-level stepping lives in cellNavigation.js; re-exported here so
// existing imports keep working.
export { isLockedCell, getNextCellInDirection } from './cellNavigation.js';

/**
 * @param {import('./types').Clue[]} clues
 * @param {import('./types').Direction} focusedDirection
 * @param {number | undefined} currentNumber
 * @param {boolean} allFilled
 * @param {number} diff
 * @returns {import('./types').Clue[]}
 */
function findCandidateClues(clues, focusedDirection, currentNumber, allFilled, diff) {
	// Coerce a missing clue number to NaN so the relational comparisons below
	// evaluate to false (matching the prior `> undefined` / `< undefined` behavior).
	const cn = currentNumber ?? NaN;
	let candidates = clues.filter(
		(clue) =>
			(allFilled || !clue.isFilled) &&
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
 * @returns {{ clue: import('./types').Clue | undefined, direction: import('./types').Direction }}
 */
function resolveNextClue(candidates, diff, clues, focusedDirection) {
	const nextClue = candidates[Math.abs(diff) - 1];
	if (nextClue) return { clue: nextClue, direction: focusedDirection };
	// Wrap into the other direction, preferring its first incomplete clue.
	const newDirection = focusedDirection === 'across' ? 'down' : 'across';
	const wrapped = clues.filter((c) => c.direction === newDirection);
	return { clue: wrapped.find((c) => !c.isFilled) || wrapped[0], direction: newDirection };
}

/**
 * @param {import('./types').Cell[]} sortedCells
 * @param {number | undefined} clueNumber
 * @param {import('./types').Direction} focusedDirection
 * @param {boolean} allFilled
 * @returns {Partial<import('./types').Cell>}
 */
function findCellForClue(sortedCells, clueNumber, focusedDirection, allFilled) {
	return (
		sortedCells.find(
			(cell) => (allFilled || !cell.value) && cell.clueNumbers[focusedDirection] === clueNumber
		) ||
		sortedCells.find((cell) => cell.clueNumbers[focusedDirection] === clueNumber) ||
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
 *   cells?: import('./types').Cell[]
 * }} params
 * @returns {{ focusedCellIndex: number, focusedDirection: import('./types').Direction }}
 */
export function getNextClueCell({
	clues,
	focusedCell,
	focusedDirection,
	sortedCellsInDirection,
	diff = 1
}) {
	const currentNumber = focusedCell.clueNumbers[focusedDirection];
	const allFilled = clues.filter((c) => c.direction === focusedDirection).every((c) => c.isFilled);
	const candidates = findCandidateClues(clues, focusedDirection, currentNumber, allFilled, diff);
	const { clue: nextClue, direction: newDirection } = resolveNextClue(
		candidates,
		diff,
		clues,
		focusedDirection
	);
	// Resolve the landing cell against the direction the clue belongs to (it
	// may differ from focusedDirection after wrapping across<->down). After a
	// wrap, allFilled described the old direction, so prefer empty cells.
	const nextCell = findCellForClue(
		sortedCellsInDirection,
		nextClue?.number,
		newDirection,
		allFilled && newDirection === focusedDirection
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

/**
 * @param {{
 *   focusedDirection: import('./types').Direction,
 *   focusedCell: import('./types').Cell
 * }} params
 * @returns {import('./types').Direction | null}
 */
export function getFlippedDirection({ focusedDirection, focusedCell }) {
	const newDirection = focusedDirection === 'across' ? 'down' : 'across';
	return focusedCell.clueNumbers[newDirection] ? newDirection : null;
}
