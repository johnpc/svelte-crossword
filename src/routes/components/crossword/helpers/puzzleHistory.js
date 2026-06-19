/**
 * Compute the new state after an undo/redo operation.
 * Returns { cells, cellsHistoryIndex, focusedCellIndex, focusedCellIndexHistoryIndex }
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
