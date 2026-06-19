/**
 * Finds the nth cell (by `diff`) in the focused direction relative to the focused cell.
 *
 * @param {object} params
 * @param {number} params.diff - Signed offset; sign chooses direction, magnitude the distance
 * @param {import('./types').Cell[]} params.cells - All grid cells
 * @param {import('./types').Direction} params.direction - Focused direction
 * @param {import('./types').Cell} params.focusedCell - Currently focused cell
 * @returns {(import('./types').Cell & { absDiff: number }) | undefined}
 */
export default ({ diff, cells, direction, focusedCell }) => {
	/** @type {'x' | 'y'} */
	const dimension = direction == 'across' ? 'x' : 'y';
	/** @type {'x' | 'y'} */
	const otherDimension = direction == 'across' ? 'y' : 'x';
	const start = focusedCell[dimension];
	const absDiff = Math.abs(diff);
	const isDiffNegative = diff < 0;

	const cellsWithDiff = cells
		.filter(
			(cell) =>
				// take out cells in other columns/rows
				cell[otherDimension] == focusedCell[otherDimension] &&
				// take out cells in wrong direction
				(isDiffNegative ? cell[dimension] < start : cell[dimension] > start)
		)
		.map((cell) => ({
			...cell,
			// how far is this cell from our focused cell?
			absDiff: Math.abs(start - cell[dimension])
		}));

	cellsWithDiff.sort((a, b) => a.absDiff - b.absDiff);
	return cellsWithDiff[absDiff - 1];
};
