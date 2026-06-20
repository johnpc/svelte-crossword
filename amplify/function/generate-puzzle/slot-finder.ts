import { SIZE, BLACK } from './grid-rules';
import { SlotEntry } from './puz-types';

export function isWhite(grid: string[], r: number, c: number): boolean {
	if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return false;
	return grid[r][c] !== BLACK;
}

/**
 * A cell starts an across slot if it's white, has no white neighbor to its
 * left, and has a white neighbor to its right (so the slot is at least 2
 * letters long).
 */
export function startsAcross(grid: string[], r: number, c: number): boolean {
	return isWhite(grid, r, c) && !isWhite(grid, r, c - 1) && isWhite(grid, r, c + 1);
}

/** Same logic vertically. */
export function startsDown(grid: string[], r: number, c: number): boolean {
	return isWhite(grid, r, c) && !isWhite(grid, r - 1, c) && isWhite(grid, r + 1, c);
}

/**
 * Walk a slot from its starting cell and read the answer. `dir` is either
 * 'across' (walk right) or 'down' (walk down). Stops at the grid edge or
 * the first black square.
 */
export function readSlotAnswer(
	grid: string[],
	r: number,
	c: number,
	dir: 'across' | 'down'
): string {
	let answer = '';
	let rr = r;
	let cc = c;
	while (rr < SIZE && cc < SIZE && isWhite(grid, rr, cc)) {
		answer += grid[rr][cc];
		if (dir === 'across') cc++;
		else rr++;
	}
	return answer;
}

/**
 * Walk the grid in reading order and emit (number, position, answer) for
 * every across and down slot. Numbers are assigned per standard crossword
 * rules: a cell gets a number iff it starts at least one slot.
 */
export function findSlots(grid: string[]): { across: SlotEntry[]; down: SlotEntry[] } {
	const across: SlotEntry[] = [];
	const down: SlotEntry[] = [];
	let nextNum = 1;
	for (let r = 0; r < SIZE; r++) {
		for (let c = 0; c < SIZE; c++) {
			if (!isWhite(grid, r, c)) continue;
			const sa = startsAcross(grid, r, c);
			const sd = startsDown(grid, r, c);
			if (!sa && !sd) continue;
			if (sa) across.push({ num: nextNum, r, c, answer: readSlotAnswer(grid, r, c, 'across') });
			if (sd) down.push({ num: nextNum, r, c, answer: readSlotAnswer(grid, r, c, 'down') });
			nextNum++;
		}
	}
	return { across, down };
}
