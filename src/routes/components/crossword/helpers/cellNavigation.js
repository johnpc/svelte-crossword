/**
 * Cell-level cursor movement: locked-cell rules and stepping between squares.
 * Word/clue-level navigation lives in puzzleNavigation.js.
 */

/**
 * A cell is locked once check mode has verified its letter as correct;
 * locked cells are never landed on or overwritten.
 * @param {import('./types').Cell} cell
 * @param {boolean} [isChecking]
 * @returns {boolean}
 */
export function isLockedCell(cell, isChecking) {
	return !!isChecking && !!cell.value && cell.value === cell.answer;
}

/**
 * A cell still needs a (new) letter: it is empty, or check mode has shown
 * its current letter to be wrong.
 * @param {import('./types').Cell} cell
 * @param {boolean} [isChecking]
 * @returns {boolean}
 */
export function needsEntry(cell, isChecking) {
	return !cell.value || (!!isChecking && cell.value !== cell.answer);
}

/**
 * Walks the grid from the focused cell, skipping filled cells when not
 * replacing and always skipping checked-correct (locked) cells.
 * @param {{
 *   sortedCellsInDirection: import('./types').Cell[],
 *   focusedCellIndex: number,
 *   diff: number,
 *   doReplaceFilledCells?: boolean,
 *   isChecking?: boolean
 * }} params
 * @returns {number | null}
 */
export function getNextCellInDirection({
	sortedCellsInDirection,
	focusedCellIndex,
	diff,
	doReplaceFilledCells = true,
	isChecking = false
}) {
	const isLandable = (/** @type {import('./types').Cell} */ cell) =>
		!isLockedCell(cell, isChecking) && (doReplaceFilledCells || needsEntry(cell, isChecking));
	const pos = sortedCellsInDirection.findIndex((d) => d.index === focusedCellIndex);
	if (pos === -1) return null;
	const step = diff > 0 ? 1 : -1;
	let remaining = Math.abs(diff);
	let i = pos;
	while (remaining > 0) {
		i += step;
		if (i < 0 || i >= sortedCellsInDirection.length) return null;
		if (isLandable(sortedCellsInDirection[i])) remaining--;
	}
	return sortedCellsInDirection[i].index;
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
