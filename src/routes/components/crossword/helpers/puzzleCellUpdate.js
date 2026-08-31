import { isLockedCell, needsEntry } from './cellNavigation.js';

const NUMBER_OF_STATES_IN_HISTORY = 10;

/**
 * Process a cell value update, returning new cells state and navigation intent.
 * Returns { cells, cellsHistory, cellsHistoryIndex, navigationAction }
 * where navigationAction is { type: 'clueDiff', diff } or { type: 'cellDiff', diff, doReplace }
 * @param {{
 *   cells: import('./types').Cell[],
 *   cellsHistory: import('./types').Cell[][],
 *   cellsHistoryIndex: number,
 *   focusedDirection: import('./types').Direction,
 *   focusedCellIndex?: number,
 *   index: number,
 *   newValue: string,
 *   diff?: number,
 *   doReplaceFilledCells?: boolean,
 *   isChecking?: boolean
 * }} params
 */
export function processCellUpdate({
	cells,
	cellsHistory,
	cellsHistoryIndex,
	focusedDirection,
	index,
	newValue,
	diff = 1,
	doReplaceFilledCells = false,
	isChecking = false
}) {
	const dimension = focusedDirection === 'across' ? 'x' : 'y';
	const clueIndex = cells[index].clueNumbers[focusedDirection];
	const allCellsInClue = cells.filter((cell) => cell.clueNumbers[focusedDirection] === clueIndex);
	// "Pending" = still needs a letter (empty, or checked-wrong in check mode);
	// the end of the clue is the last pending square, so a wrong letter later
	// in the word keeps the cursor inside it instead of jumping to the next clue.
	const pendingCells = allCellsInClue.filter((cell) => needsEntry(cell, isChecking));
	const allCellsInClueDone = pendingCells.length === 0;

	const cellsToCheck = allCellsInClueDone ? allCellsInClue : pendingCells;
	const cellsInCluePositions = cellsToCheck
		.map((cell) => cell[dimension])
		.filter(/** @returns {n is number} */ (n) => Number.isFinite(n));
	const isAtEndOfClue = cells[index][dimension] === Math.max(...cellsInCluePositions);

	// Checked-correct letters are locked: keep the value and only navigate.
	const isLocked = isLockedCell(cells[index], isChecking);
	const newCells = isLocked
		? cells
		: [
				...cells.slice(0, index),
				{ ...cells[index], value: newValue.toUpperCase() },
				...cells.slice(index + 1)
			];
	const newHistory = [newCells, ...cellsHistory.slice(cellsHistoryIndex)].slice(
		0,
		NUMBER_OF_STATES_IN_HISTORY
	);

	const navigationAction =
		isAtEndOfClue && diff > 0
			? { type: 'clueDiff', diff }
			: { type: 'cellDiff', diff, doReplace: allCellsInClueDone || doReplaceFilledCells };

	return {
		cells: newCells,
		cellsHistory: newHistory,
		cellsHistoryIndex: 0,
		navigationAction
	};
}

/**
 * Classify a keyboard event key into an action.
 * Returns { type: 'delete' } | { type: 'letter', value } | null
 * @param {string} key
 * @param {boolean} [ctrlKey]
 * @param {boolean} [altKey]
 * @returns {{ type: 'delete' } | { type: 'letter', value: string } | null}
 */
export function classifyKey(key, ctrlKey = false, altKey = false) {
	if (ctrlKey || altKey) return null;
	if (['Delete', 'Backspace'].includes(key)) {
		return { type: 'delete' };
	}
	if (/^[a-zA-Z()]$/.test(key)) {
		return { type: 'letter', value: key.toUpperCase() };
	}
	return null;
}
