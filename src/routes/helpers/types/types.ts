import type { Schema } from '../../../../amplify/data/resource';

export type Clue = {
	clue: string;
	answer: string;
	direction: 'across' | 'down';
	x: number;
	y: number;
};

export type HydratedProfile = Schema['Profile'] & {
	completedPuzzles: Schema['UserPuzzle'][];
};

export type CrosswordClues = {
	id: string;
	clues: Clue[];
};
