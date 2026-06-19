// Shared types for the crossword engine. These describe the data structures
// that flow through the engine helpers (cells, clues, and the reducer state).
// The helpers are authored in JS and annotated with JSDoc `@type`/`@param`
// imports of these types, so the whole engine is type-checked under checkJs.

export type Direction = 'across' | 'down';

/** Map of direction -> clue number for a cell that starts/contains clues. */
export type ClueNumbers = Partial<Record<Direction, number>>;

/** A single grid square. */
export interface Cell {
	id: string;
	x: number;
	y: number;
	index: number;
	number?: number;
	value?: string;
	answer: string;
	custom?: string;
	clueNumbers: ClueNumbers;
	[key: string]: unknown;
}

/** A clue plus the cells that make up its answer. */
export interface Clue {
	id: string;
	x: number;
	y: number;
	direction: Direction;
	clue: string;
	answer: string;
	number: number;
	index: number;
	cells: Cell[];
	custom?: string;
	isFilled?: boolean;
	isCorrect?: boolean;
	[key: string]: unknown;
}

/** Raw clue input as authored in puzzle data (before the engine enriches it). */
export interface ClueInput {
	x: number;
	y: number;
	direction: Direction;
	clue: string;
	answer: string;
	custom?: string;
	[key: string]: unknown;
}

/** Map of cell id -> its index in the cells array. */
export type CellIndexMap = Record<string, number>;

/**
 * The full reducer state the puzzle controller operates over. Built by the
 * Puzzle component's `s()` snapshot and consumed by the action resolvers.
 */
export interface PuzzleState {
	cells: Cell[];
	cellsHistory: Cell[][];
	cellsHistoryIndex: number;
	focusedDirection: Direction;
	focusedCellIndex: number;
	focusedCell: Cell;
	focusedCellIndexHistory: number[];
	focusedCellIndexHistoryIndex: number;
	sortedCellsInDirection: Cell[];
	clues: Clue[];
	isPuzzleFocused: boolean;
	numberOfStatesInHistory: number;
}

/** A partial state patch returned by an action resolver. */
export type StatePatch = Partial<PuzzleState> & { _focusHidden?: boolean };

/** An action object dispatched into the puzzle reducer. */
export type PuzzleAction = { type: string } & Record<string, unknown>;
