import { buildWordIndex, getCandidates } from './word-index';

export interface GeneratedGrid {
	across: string[];
	down: string[];
	solution: string;
}

const PER_ATTEMPT_BUDGET_MS = 3000;
const TOTAL_BUDGET_MS = 60_000;

function shuffle<T>(arr: T[]): T[] {
	const result = [...arr];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

class DeadlineError extends Error {
	constructor() {
		super('deadline');
		this.name = 'DeadlineError';
	}
}

export function generateGrid(words: string[]): GeneratedGrid | null {
	const index = buildWordIndex(words);
	const wordSet = new Set(words);
	const shuffled = shuffle(words);
	const totalDeadline = Date.now() + TOTAL_BUDGET_MS;

	for (let attempt = 0; attempt < shuffled.length; attempt++) {
		if (Date.now() >= totalDeadline) break;

		const startWord = shuffled[attempt];
		const grid: string[] = [startWord];
		const attemptDeadline = Math.min(Date.now() + PER_ATTEMPT_BUDGET_MS, totalDeadline);

		try {
			if (backtrack(index, wordSet, grid, 1, attemptDeadline)) {
				const across = grid.slice();
				const down: string[] = [];
				for (let col = 0; col < 5; col++) {
					let word = '';
					for (let row = 0; row < 5; row++) {
						word += grid[row][col];
					}
					down.push(word);
				}
				return { across, down, solution: grid.join('') };
			}
		} catch (e) {
			if (!(e instanceof DeadlineError)) throw e;
			// Per-attempt deadline hit — move on to the next start word.
		}
	}

	return null;
}

function backtrack(
	index: ReturnType<typeof buildWordIndex>,
	wordSet: Set<string>,
	grid: string[],
	row: number,
	deadline: number
): boolean {
	if (Date.now() >= deadline) throw new DeadlineError();
	if (row === 5) {
		const down: string[] = [];
		for (let col = 0; col < 5; col++) {
			let word = '';
			for (let r = 0; r < 5; r++) {
				word += grid[r][col];
			}
			if (!wordSet.has(word)) return false;
			down.push(word);
		}
		// Reject word squares (across === down) — we want 10 distinct words
		for (let i = 0; i < 5; i++) {
			if (grid[i] === down[i]) return false;
		}
		return true;
	}

	// Early symmetry rejection: if the partial grid is forming a word square, skip
	if (row >= 2) {
		let symmetric = true;
		for (let r = 0; r < row && symmetric; r++) {
			for (let c = r + 1; c < row && symmetric; c++) {
				if (grid[r][c] !== grid[c][r]) symmetric = false;
			}
		}
		if (symmetric) return false;
	}

	// Build column constraints from rows placed so far
	const colConstraints: (string | null)[][] = [];
	for (let col = 0; col < 5; col++) {
		const constraints: (string | null)[] = [null, null, null, null, null];
		for (let r = 0; r < row; r++) {
			constraints[r] = grid[r][col];
		}
		colConstraints.push(constraints);
	}

	// Find candidate words for this row
	let candidates = getCandidatesForRow(index, wordSet, grid, colConstraints, row);
	candidates = shuffle(candidates);

	// Try fewer candidates at deeper rows to fail fast on bad branches
	const maxTries = Math.min(candidates.length, row >= 3 ? 50 : 150);

	for (let i = 0; i < maxTries; i++) {
		grid[row] = candidates[i];
		if (backtrack(index, wordSet, grid, row + 1, deadline)) {
			return true;
		}
	}

	grid.length = row;
	return false;
}

function getCandidatesForRow(
	index: ReturnType<typeof buildWordIndex>,
	wordSet: Set<string>,
	grid: string[],
	colConstraints: (string | null)[][],
	row: number
): string[] {
	// Start with the most constrained column to narrow candidates fast
	let bestCol = 0;
	let bestCount = Infinity;

	for (let col = 0; col < 5; col++) {
		const count = getCandidates(index, colConstraints[col]).length;
		if (count < bestCount) {
			bestCount = count;
			bestCol = col;
		}
	}

	// Get all possible letters at the most constrained column position
	const colWords = getCandidates(index, colConstraints[bestCol]);
	const possibleLetters = new Set(colWords.map((w) => w[row]));

	// Get all words that have one of those letters at position bestCol
	const initial: string[] = [];
	for (const letter of possibleLetters) {
		const posMap = index.get(bestCol);
		if (!posMap) continue;
		const words = posMap.get(letter) || [];
		initial.push(...words);
	}

	// Filter: word not already used, and placing it keeps all columns viable
	return initial.filter((word) => {
		if (grid.includes(word)) return false;

		for (let col = 0; col < 5; col++) {
			const constraints: (string | null)[] = [...colConstraints[col]];
			constraints[row] = word[col];
			const viable = getCandidates(index, constraints);
			if (viable.length === 0) return false;
		}
		return true;
	});
}
