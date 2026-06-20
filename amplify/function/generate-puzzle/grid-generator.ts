import { buildWordIndex, WordIndex } from './word-index';
import { shuffle } from './shuffle';
import { DeadlineError, checkDeadline } from './deadline';
import { SIZE, isFormingWordSquare, readDownWords, validateCompleteGrid } from './grid-rules';
import { buildColConstraints, getCandidatesForRow } from './candidate-finder';

export interface GeneratedGrid {
	across: string[];
	down: string[];
	solution: string;
}

const PER_ATTEMPT_BUDGET_MS = 5000;
const TOTAL_BUDGET_MS = 180_000;
const MAX_TRIES_DEEP = 50;
const MAX_TRIES_SHALLOW = 150;
const DEEP_ROW_THRESHOLD = 3;

export function generateGrid(words: string[]): GeneratedGrid | null {
	const index = buildWordIndex(words);
	const wordSet = new Set(words);
	const shuffled = shuffle(words);
	const totalDeadline = Date.now() + TOTAL_BUDGET_MS;

	for (let attempt = 0; attempt < shuffled.length; attempt++) {
		if (Date.now() >= totalDeadline) break;
		const result = tryStartWord(shuffled[attempt], index, wordSet, totalDeadline);
		if (result) return result;
	}

	return null;
}

/**
 * Re-throw any error that isn't our cooperative DeadlineError. Extracted so
 * the rethrow branch is independently testable from the recursive backtracker.
 */
export function rethrowIfNotDeadline(e: unknown): void {
	if (!(e instanceof DeadlineError)) throw e;
}

function tryStartWord(
	startWord: string,
	index: WordIndex,
	wordSet: Set<string>,
	totalDeadline: number
): GeneratedGrid | null {
	const grid: string[] = [startWord];
	const attemptDeadline = Math.min(Date.now() + PER_ATTEMPT_BUDGET_MS, totalDeadline);
	try {
		if (backtrack(index, wordSet, grid, 1, attemptDeadline)) {
			return finalizeGrid(grid);
		}
	} catch (e) {
		rethrowIfNotDeadline(e);
	}
	return null;
}

function finalizeGrid(grid: string[]): GeneratedGrid {
	const across = grid.slice();
	const down = readDownWords(grid);
	return { across, down, solution: grid.join('') };
}

function backtrack(
	index: WordIndex,
	wordSet: Set<string>,
	grid: string[],
	row: number,
	deadline: number
): boolean {
	checkDeadline(deadline);

	if (row === SIZE) {
		return validateCompleteGrid(grid, wordSet);
	}

	if (isFormingWordSquare(grid, row)) return false;

	const colConstraints = buildColConstraints(grid, row);
	const candidates = shuffle(getCandidatesForRow(index, grid, colConstraints, row));
	const maxTries = Math.min(
		candidates.length,
		row >= DEEP_ROW_THRESHOLD ? MAX_TRIES_DEEP : MAX_TRIES_SHALLOW
	);

	for (let i = 0; i < maxTries; i++) {
		grid[row] = candidates[i];
		if (backtrack(index, wordSet, grid, row + 1, deadline)) return true;
	}

	grid.length = row;
	return false;
}
