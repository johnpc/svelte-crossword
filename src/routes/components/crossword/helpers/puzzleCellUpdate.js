import { isLockedCell } from './puzzleNavigation.js';

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
	const allCellsInClueFilled = allCellsInClue.every((cell) => cell.value);

	const cellsToCheck = allCellsInClueFilled
		? allCellsInClue
		: allCellsInClue.filter((cell) => !cell.value);
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
			: { type: 'cellDiff', diff, doReplace: allCellsInClueFilled || doReplaceFilledCells };

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
