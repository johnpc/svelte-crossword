/**
 * Pure logic functions extracted from Crossword.svelte
 * for testability and to reduce component size.
 */

/**
 * Check each clue's completion status against current cell values.
 * @param {Array} clues - array of clue objects with cells and answer
 * @param {Array} cells - array of cell objects with id, value, answer
 * @returns {Array} clues annotated with isCorrect and isFilled
 */
export function checkClueCompletion(clues, cells) {
	return clues.map((d) => {
		const cellChecks = d.cells.map((c) => {
			const cell = cells.find((e) => e.id === c.id);
			const value = cell ? cell.value : '';
			const hasValue = !!value;
			const hasCorrect = value === c.answer;
			return { hasValue, hasCorrect };
		});
		const isCorrect = cellChecks.filter((c) => c.hasCorrect).length === d.answer.length;
		const isFilled = cellChecks.filter((c) => c.hasValue).length === d.answer.length;
		return {
			...d,
			isCorrect,
			isFilled
		};
	});
}

/**
 * Clear all cell values.
 * @param {Array} cells - array of cell objects
 * @returns {Array} new cells with value set to ''
 */
export function clearCells(cells) {
	return cells.map((cell) => ({
		...cell,
		value: ''
	}));
}

/**
 * Reveal all cell answers.
 * @param {Array} cells - array of cell objects with answer property
 * @returns {Array} new cells with value set to answer
 */
export function revealCells(cells) {
	return cells.map((cell) => ({
		...cell,
		value: cell.answer
	}));
}

/**
 * Get the default reset state for the crossword.
 * @returns {object} { isRevealing, isChecking, focusedCellIndex, focusedDirection }
 */
export function getInitialState() {
	return {
		isRevealing: false,
		isChecking: false,
		focusedCellIndex: 0,
		focusedDirection: 'across'
	};
}
