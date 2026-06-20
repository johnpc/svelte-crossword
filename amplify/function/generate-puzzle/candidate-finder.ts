import { WordIndex, getCandidates } from './word-index';
import { SIZE } from './grid-rules';

/**
 * Build the column-letter constraints implied by all rows placed so far.
 * Each column gets a length-SIZE array where each entry is either the
 * letter forced into that cell by an earlier row, or null (unknown).
 */
export function buildColConstraints(grid: string[], rowsPlaced: number): (string | null)[][] {
	const colConstraints: (string | null)[][] = [];
	for (let col = 0; col < SIZE; col++) {
		const constraints: (string | null)[] = new Array(SIZE).fill(null);
		for (let r = 0; r < rowsPlaced; r++) {
			constraints[r] = grid[r][col];
		}
		colConstraints.push(constraints);
	}
	return colConstraints;
}

/**
 * Pick the column with the fewest viable down-word candidates so we narrow
 * the search space fast (most-constrained-variable heuristic).
 */
export function findMostConstrainedColumn(
	index: WordIndex,
	colConstraints: (string | null)[][]
): number {
	let bestCol = 0;
	let bestCount = Infinity;
	for (let col = 0; col < SIZE; col++) {
		const count = getCandidates(index, colConstraints[col]).length;
		if (count < bestCount) {
			bestCount = count;
			bestCol = col;
		}
	}
	return bestCol;
}

/**
 * Collect every word in `index` that has any of the given letters at the
 * given column position. Returns [] if the column has no entries.
 */
export function collectInitialCandidates(
	index: WordIndex,
	col: number,
	letters: Set<string>
): string[] {
	const posMap = index.get(col);
	if (!posMap) return [];
	const initial: string[] = [];
	for (const letter of letters) {
		const words = posMap.get(letter) || [];
		initial.push(...words);
	}
	return initial;
}

/** Whether the given row is the top or bottom row (where black squares can land). */
export function isEdgeRow(row: number): boolean {
	return row === 0 || row === SIZE - 1;
}

/**
 * Returns true iff placing `word` at `row` keeps every column with at least
 * one viable down-word candidate.
 */
export function placementKeepsColumnsViable(
	index: WordIndex,
	colConstraints: (string | null)[][],
	row: number,
	word: string
): boolean {
	for (let col = 0; col < SIZE; col++) {
		const constraints: (string | null)[] = [...colConstraints[col]];
		constraints[row] = word[col];
		if (getCandidates(index, constraints).length === 0) return false;
	}
	return true;
}

/**
 * For the row currently being filled, find candidate words that:
 * 1. Don't reuse a word already in the grid (compared by trimmed form so
 *    leading/trailing-space variants of the same 4-letter word collide).
 * 2. Don't put a black square anywhere except the top or bottom edge row.
 * 3. Keep every column viable after placement.
 */
export function getCandidatesForRow(
	index: WordIndex,
	grid: string[],
	colConstraints: (string | null)[][],
	row: number
): string[] {
	const bestCol = findMostConstrainedColumn(index, colConstraints);
	const colWords = getCandidates(index, colConstraints[bestCol]);
	const possibleLetters = new Set(colWords.map((w) => w[row]));
	const initial = collectInitialCandidates(index, bestCol, possibleLetters);
	const usedTrimmed = new Set(grid.map((w) => w.trim()));
	const edge = isEdgeRow(row);
	return initial.filter((word) => {
		if (usedTrimmed.has(word.trim())) return false;
		if (!edge && word.includes(' ')) return false;
		return placementKeepsColumnsViable(index, colConstraints, row, word);
	});
}
