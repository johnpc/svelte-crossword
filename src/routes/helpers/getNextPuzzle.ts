import type { Schema } from '../../../amplify/data/resource';
import { getAllUserPuzzles } from './getAllUserPuzzles';
import type { Clue, CrosswordClues, HydratedProfile } from './types/types';
import { getAllPuzzles } from './getAllPuzzles';

const getCompletedPuzzleIds = async (profile: HydratedProfile): Promise<string[]> => {
	const completedPuzzles = await getAllUserPuzzles(profile, true);
	const completedPuzzleIds = completedPuzzles.map(
		(completedPuzzle) => completedPuzzle.userPuzzlePuzzleId!
	);
	console.log({ completedPuzzleIds });
	return completedPuzzleIds;
};

const getCluesFromPuzzle = (puzzle: Schema['Puzzle']) => {
	if (!puzzle) {
		return [];
	}
	const jsonAtIndex = JSON.parse(puzzle.puzJson as string);
	const across = Object.values(jsonAtIndex.clues.across) as Clue[];
	const down = Object.values(jsonAtIndex.clues.down) as Clue[];
	return [...across, ...down];
};

export const getNextPuzzle = async (profile: HydratedProfile): Promise<CrosswordClues> => {
	const allCompletedPuzzleIds = await getCompletedPuzzleIds(profile);
	const allPuzzles = await getAllPuzzles(profile, true);
	console.log({ allCompletedPuzzleIds, allStoredPuzzles: allPuzzles });
	const incompletePuzzles = allPuzzles.filter((puzzle) => {
		return !allCompletedPuzzleIds.includes(puzzle.id);
	});

	console.log({ incompletePuzzles });
	const chosenPuzzle = incompletePuzzles[0]!;
	console.log({ puzzles: incompletePuzzles, chosenPuzzle });
	const clues = getCluesFromPuzzle(chosenPuzzle);
	console.log({ clues, puzzle: chosenPuzzle });
	return {
		id: chosenPuzzle.id,
		clues
	};
};
