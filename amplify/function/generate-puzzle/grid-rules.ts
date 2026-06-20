export const SIZE = 5;
export const BLACK = ' ';

/**
 * A partial fill is forming a word square if every placed letter at (r,c)
 * matches the letter at (c,r) — i.e. across rows and down columns are
 * mirror-equal so far. Returns true only when at least 2 rows are placed
 * (a single row is trivially "symmetric" against itself).
 */
export function isFormingWordSquare(grid: string[], rowsPlaced: number): boolean {
	if (rowsPlaced < 2) return false;
	for (let r = 0; r < rowsPlaced; r++) {
		for (let c = r + 1; c < rowsPlaced; c++) {
			if (grid[r][c] !== grid[c][r]) return false;
		}
	}
	return true;
}

/**
 * Black squares (encoded as space) are only legal at the four corners and
 * must be 180°-rotationally symmetric. A center black, edge-but-non-corner
 * black, or asymmetric corner pair is invalid.
 */
export function hasValidBlackPattern(grid: string[]): boolean {
	const tl = grid[0][0] === BLACK;
	const tr = grid[0][SIZE - 1] === BLACK;
	const bl = grid[SIZE - 1][0] === BLACK;
	const br = grid[SIZE - 1][SIZE - 1] === BLACK;
	if (tl !== br) return false;
	if (tr !== bl) return false;
	for (let r = 0; r < SIZE; r++) {
		for (let c = 0; c < SIZE; c++) {
			const isCorner = (r === 0 || r === SIZE - 1) && (c === 0 || c === SIZE - 1);
			if (!isCorner && grid[r][c] === BLACK) return false;
		}
	}
	return true;
}

/**
 * A "word square" has across[i] === down[i] for every i, meaning only 5
 * unique words across both directions. We want 10 distinct words, so reject.
 */
export function isWordSquare(grid: string[], down: string[]): boolean {
	for (let i = 0; i < SIZE; i++) {
		if (grid[i] === down[i]) return true;
	}
	return false;
}

/**
 * Read the down words from the placed grid (column-by-column, top-to-bottom).
 */
export function readDownWords(grid: string[]): string[] {
	const down: string[] = [];
	for (let col = 0; col < SIZE; col++) {
		let word = '';
		for (let r = 0; r < SIZE; r++) {
			word += grid[r][col];
		}
		down.push(word);
	}
	return down;
}

/**
 * Final-stage validation for a fully-placed grid: every down word must be in
 * the word set, the across/down placement must not form a word square, and
 * any black squares must form a legal corner pattern.
 */
export function validateCompleteGrid(grid: string[], wordSet: Set<string>): boolean {
	const down = readDownWords(grid);
	for (const w of down) {
		if (!wordSet.has(w)) return false;
	}
	if (isWordSquare(grid, down)) return false;
	if (!hasValidBlackPattern(grid)) return false;
	return true;
}
