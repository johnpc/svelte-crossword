export type Clue = {
	clue: string;
	answer: string;
	direction: 'across' | 'down';
	x: number;
	y: number;
};

export type HydratedProfile = { id: string; email: string };

export type HydratedPuzzle = { id: string; clues: Clue[]; createdAt: string };

export type HydratedUserPuzzle = {
	id: string;
	profileCompletedPuzzlesId: string;
	timeInSeconds: number;
	usedCheck: boolean;
	usedClear: boolean;
	usedReveal: boolean;
	userPuzzlePuzzleId: string;
	createdAt: string;
};

export type CrosswordClues = {
	id: string;
	clues: Clue[];
};
