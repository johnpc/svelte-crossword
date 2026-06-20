import { generateGrid, GeneratedGrid } from './grid-generator';
import { formatPuzzle } from './format-puzzle';
import { GeneratedClues } from './clue-generator';
import { PuzJson } from './puz-types';

const MAX_GRID_ATTEMPTS = 10;

/** Resolve "today" as YYYY-MM-DD in UTC. */
export function todayDateString(): string {
	return new Date().toISOString().split('T')[0];
}

/** Stable, dedup-friendly puzzle id keyed by date. */
export function puzzleIdFor(dateStr: string): string {
	return `generated-${dateStr}`;
}

/**
 * Try up to MAX_GRID_ATTEMPTS candidate grids and return the first valid
 * one. Returns null if every attempt fails.
 */
export function generateUniqueGrid(words: string[]): GeneratedGrid | null {
	for (let attempt = 0; attempt < MAX_GRID_ATTEMPTS; attempt++) {
		const candidate = generateGrid(words);
		if (candidate) return candidate;
	}
	return null;
}

export function buildPuzzleJson(grid: GeneratedGrid, clues: GeneratedClues): PuzJson {
	return formatPuzzle(grid, clues);
}
