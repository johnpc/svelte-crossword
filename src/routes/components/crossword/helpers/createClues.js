import assignClueNumbers from './assignClueNumbers.js';
import buildCluesCells from './buildCluesCells.js';

/**
 * Builds enriched clue objects (with ids, numbers, cells, and indices) from raw
 * authored clue input.
 *
 * @param {import('./types').ClueInput[]} data - Raw authored clues
 * @returns {import('./types').Clue[]} Enriched clues
 */
export default function createClues(data) {
	// determine if 0 or 1 based
	const minX = Math.min(...data.map((d) => d.x));
	const minY = Math.min(...data.map((d) => d.y));
	const adjust = Math.min(minX, minY);

	const withAdjust = data.map((d) => ({
		...d,
		x: d.x - adjust,
		y: d.y - adjust
	}));

	const withId = withAdjust.map((d) => ({
		...d,
		id: `${d.x}-${d.y}`
	}));

	// sort asc by start position of clue so we have proper clue ordering
	withId.sort((a, b) => a.y - b.y || a.x - b.x);

	// assign clue numbers (reusing number for shared start positions)
	const withNumber = assignClueNumbers(withId);

	// create cells for each letter
	const withCells = buildCluesCells(withNumber);

	// sort by direction then number
	withCells.sort((a, b) => {
		if (a.direction < b.direction) return -1;
		if (a.direction > b.direction) return 1;
		return a.number - b.number;
	});

	const withIndex = withCells.map((d, i) => ({
		...d,
		index: i
	}));

	return withIndex;
}
