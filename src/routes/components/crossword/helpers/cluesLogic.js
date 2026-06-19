/**
 * Returns the opposite crossword direction.
 * @param {import('./types').Direction} direction - 'across' or 'down'
 * @returns {import('./types').Direction}
 */
export function getOppositeDirection(direction) {
	return direction === 'across' ? 'down' : 'across';
}

/**
 * Wraps a clue index within bounds.
 * @param {number} index - The raw next index (may be out of bounds)
 * @param {number} totalClues - Total number of clues
 * @returns {number}
 */
export function getNextClueIndex(index, totalClues) {
	if (index < 0) return totalClues - 1;
	if (index > totalClues - 1) return 0;
	return index;
}

/**
 * Computes the new focused direction and cell index after clicking a clue.
 * @param {object} params
 * @param {import('./types').Direction} params.direction - Direction of the clicked clue
 * @param {string} params.id - ID of the clicked clue
 * @param {import('./types').CellIndexMap} params.cellIndexMap - Map of cell IDs to indices
 * @param {import('./types').Clue[]} params.clues - All clues
 * @param {number} params.focusedCellIndex - Currently focused cell index
 * @param {import('./types').Direction} params.focusedDirection - Currently focused direction
 * @returns {{ focusedDirection: import('./types').Direction, focusedCellIndex: number }}
 */
export function getClueTarget({
	direction,
	id,
	cellIndexMap,
	clues,
	focusedCellIndex,
	focusedDirection
}) {
	const targetCellIndex = cellIndexMap[id] || 0;

	if (focusedCellIndex === targetCellIndex && focusedDirection === direction) {
		const oppositeDirection = getOppositeDirection(direction);
		const cell = Object.entries(cellIndexMap).find(([, idx]) => idx === targetCellIndex);
		if (cell) {
			const [cellId] = cell;
			const hasOppositeClue = clues.some(
				(c) => c.direction === oppositeDirection && c.id === cellId
			);
			if (hasOppositeClue) {
				return { focusedDirection: oppositeDirection, focusedCellIndex };
			}
		}
		return { focusedDirection, focusedCellIndex };
	}

	return { focusedDirection: direction, focusedCellIndex: targetCellIndex };
}
