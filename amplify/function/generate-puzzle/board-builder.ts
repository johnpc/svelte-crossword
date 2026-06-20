import { SIZE, BLACK } from './grid-rules';
import { PuzBoardCell, SlotEntry } from './puz-types';
import { isWhite } from './slot-finder';

/**
 * For each cell, record which across/down slot number it belongs to. Cells
 * not in any slot (or blank cells) get 0 in that direction.
 */
export function buildSlotMembership(
	grid: string[],
	across: SlotEntry[],
	down: SlotEntry[]
): { acrossMembership: number[][]; downMembership: number[][] } {
	const acrossMembership: number[][] = [];
	const downMembership: number[][] = [];
	for (let r = 0; r < SIZE; r++) {
		acrossMembership.push(new Array(SIZE).fill(0));
		downMembership.push(new Array(SIZE).fill(0));
	}
	for (const entry of across) {
		let cc = entry.c;
		while (cc < SIZE && isWhite(grid, entry.r, cc)) {
			acrossMembership[entry.r][cc] = entry.num;
			cc++;
		}
	}
	for (const entry of down) {
		let rr = entry.r;
		while (rr < SIZE && isWhite(grid, rr, entry.c)) {
			downMembership[rr][entry.c] = entry.num;
			rr++;
		}
	}
	return { acrossMembership, downMembership };
}

export function buildBoard(
	grid: string[],
	acrossMembership: number[][],
	downMembership: number[][]
): PuzBoardCell[][] {
	const board: PuzBoardCell[][] = [];
	for (let r = 0; r < SIZE; r++) {
		const boardRow: PuzBoardCell[] = [];
		for (let c = 0; c < SIZE; c++) {
			const isBlank = grid[r][c] === BLACK;
			boardRow.push({
				x: c,
				y: r,
				letter: isBlank ? '.' : grid[r][c],
				isBlank,
				acrossClue: acrossMembership[r][c],
				downClue: downMembership[r][c]
			});
		}
		board.push(boardRow);
	}
	return board;
}

/**
 * Solution string uses '.' for black cells (standard .puz convention).
 * State string is '-' for empty white cells, '.' for black cells.
 */
export function buildSolutionAndState(grid: string[]): { solution: string; state: string } {
	let solution = '';
	for (let r = 0; r < SIZE; r++) {
		for (let c = 0; c < SIZE; c++) {
			solution += grid[r][c] === BLACK ? '.' : grid[r][c];
		}
	}
	const state = solution
		.split('')
		.map((ch) => (ch === '.' ? '.' : '-'))
		.join('');
	return { solution, state };
}
