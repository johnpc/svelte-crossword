/**
 * Compute the new state after an undo/redo operation.
 * Returns { cells, cellsHistoryIndex, focusedCellIndex, focusedCellIndexHistoryIndex }
 * @param {{
 *   diff: number,
 *   cells: import('./types').Cell[],
 *   cellsHistory: import('./types').Cell[][],
 *   cellsHistoryIndex: number,
 *   focusedCellIndex: number,
 *   focusedCellIndexHistory: number[],
 *   focusedCellIndexHistoryIndex: number
 * }} params
 */
export function applyHistoricalChange({
	diff,
	cells,
	cellsHistory,
	cellsHistoryIndex,
	focusedCellIndex,
	focusedCellIndexHistory,
	focusedCellIndexHistoryIndex
}) {
	const newCellsHistoryIndex = cellsHistoryIndex + -diff;
	const newFocusedCellIndexHistoryIndex = focusedCellIndexHistoryIndex + -diff;

	return {
		cells: cellsHistory[newCellsHistoryIndex] || cells,
		cellsHistoryIndex: newCellsHistoryIndex,
		focusedCellIndex: focusedCellIndexHistory[newCellsHistoryIndex] || focusedCellIndex,
		focusedCellIndexHistoryIndex: newFocusedCellIndexHistoryIndex
	};
}
