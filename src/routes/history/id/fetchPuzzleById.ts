import { invokeSqlQuery } from '../../helpers/sql/invokeSqlQuery';
import type { Clue } from '../../helpers/types/types';

export type UserPuzzleData = {
	time_in_seconds: number;
	used_check: number;
	used_clear: number;
	used_reveal: number;
	puzzle_id: string;
};

export type FetchPuzzleResult = {
	userPuzzle: UserPuzzleData;
	clues: Clue[];
};

type PuzJson = { clues: { across: Record<string, Clue>; down: Record<string, Clue> } };

export const fetchPuzzleById = async (userPuzzleId: string): Promise<FetchPuzzleResult> => {
	const userPuzzle = await invokeSqlQuery<UserPuzzleData>({ query: 'getUserPuzzle', userPuzzleId });
	const puzzle = await invokeSqlQuery<{ puz_json: string | PuzJson }>({
		query: 'getPuzzle',
		puzzleId: userPuzzle.puzzle_id
	});

	// The Lambda decodes puz_json once; only legacy double-encoded rows still
	// arrive as a string (same contract getNextPuzzle handles).
	const jsonAtIndex: PuzJson =
		typeof puzzle.puz_json === 'string' ? JSON.parse(puzzle.puz_json) : puzzle.puz_json;
	const across = Object.values(jsonAtIndex.clues.across) as Clue[];
	const down = Object.values(jsonAtIndex.clues.down) as Clue[];

	return { userPuzzle, clues: [...across, ...down] };
};
