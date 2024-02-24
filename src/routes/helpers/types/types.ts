export type Clue = {
	clue: string;
	answer: string;
	direction: 'across' | 'down';
	x: number;
	y: number;
};

export type HydratedProfile = { id: string };

export type CrosswordClues = {
	id: string;
	clues: Clue[];
};
