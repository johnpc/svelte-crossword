/**
 * Fixture puzzle set for the fake backend. Each puzzle carries the string a
 * solver types from the first square with the app's auto-advance (across
 * clues in order, which fills every down answer too), so scenarios can "solve"
 * deterministically. `createdAt` decides the serving order (newest first).
 */
import { previewClues } from '../../src/routes/preview/previewClues';

export type FixtureClue = {
	clue: string;
	answer: string;
	x: number;
	y: number;
	direction: 'across' | 'down';
};

export type FixturePuzzle = {
	id: string;
	title: string;
	author: string;
	createdAt: string;
	clues: FixtureClue[];
	/** Letters typed from cell (0,0) that solve the whole grid. */
	typing: string;
};

export const PREVIEW_MINI: FixturePuzzle = {
	id: 'fixture-preview-mini',
	title: 'Preview Mini',
	author: 'Fixture Author',
	createdAt: '2026-03-02T09:00:00.000Z',
	clues: previewClues as FixtureClue[],
	typing: 'TISBOWIESWIMSPAPASEXO'
};

export const WORD_SQUARE: FixturePuzzle = {
	id: 'fixture-word-square',
	title: 'Word Square',
	author: 'Fixture Author',
	createdAt: '2026-03-01T09:00:00.000Z',
	clues: [
		{ clue: 'Feline friend', answer: 'CAT', x: 0, y: 0, direction: 'across' },
		{ clue: '"You ___ here"', answer: 'ARE', x: 0, y: 1, direction: 'across' },
		{ clue: 'Half of twenty', answer: 'TEN', x: 0, y: 2, direction: 'across' },
		{ clue: 'Feline friend, again', answer: 'CAT', x: 0, y: 0, direction: 'down' },
		{ clue: '"You ___ here", again', answer: 'ARE', x: 1, y: 0, direction: 'down' },
		{ clue: 'Half of twenty, again', answer: 'TEN', x: 2, y: 0, direction: 'down' }
	],
	typing: 'CATARETEN'
};

/** Served newest-first: Preview Mini, then Word Square, then "out of puzzles". */
export const FIXTURE_PUZZLES: FixturePuzzle[] = [PREVIEW_MINI, WORD_SQUARE];

/** The `puz_json` document the real sql-queries Lambda stores and returns. */
export const toPuzJson = (puzzle: FixturePuzzle) => {
	const byDirection = (direction: 'across' | 'down') =>
		Object.fromEntries(
			puzzle.clues.filter((c) => c.direction === direction).map((c, i) => [String(i + 1), c])
		);
	return {
		header: { title: puzzle.title, author: puzzle.author },
		clues: { across: byDirection('across'), down: byDirection('down') },
		puzzle: { solution: puzzle.typing, state: '' }
	};
};
