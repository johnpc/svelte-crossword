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

export const fetchPuzzleById = async (userPuzzleId: string): Promise<FetchPuzzleResult> => {
	const userPuzzle = await invokeSqlQuery<UserPuzzleData>({ query: 'getUserPuzzle', userPuzzleId });
	const puzzle = await invokeSqlQuery<{ puz_json: string }>({
		query: 'getPuzzle',
		puzzleId: userPuzzle.puzzle_id
	});

	const jsonAtIndex = JSON.parse(puzzle.puz_json);
	const across = Object.values(jsonAtIndex.clues.across) as Clue[];
	const down = Object.values(jsonAtIndex.clues.down) as Clue[];

	return { userPuzzle, clues: [...across, ...down] };
};
