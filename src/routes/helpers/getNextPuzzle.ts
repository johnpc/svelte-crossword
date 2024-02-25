import { getAllUserPuzzles } from './getAllUserPuzzles';
import type { CrosswordClues, HydratedProfile } from './types/types';
import { getAllPuzzles } from './getAllPuzzles';

const getCompletedPuzzleIds = async (profile: HydratedProfile): Promise<string[]> => {
	console.log({ time: Date.now(), invoking: 'getCompletedPuzzleIds' });
	const completedPuzzles = await getAllUserPuzzles(profile);
	const completedPuzzleIds = completedPuzzles.map(
		(completedPuzzle) => completedPuzzle.userPuzzlePuzzleId!
	);
	console.log({ completedPuzzleIds });
	return completedPuzzleIds;
};

export const getNextPuzzle = async (profile: HydratedProfile): Promise<CrosswordClues> => {
	console.log({ time: Date.now(), invoking: 'getNextPuzzle' });
	const allCompletedPuzzleIds = await getCompletedPuzzleIds(profile);
	const allPuzzles = await getAllPuzzles(profile);
	console.log({ allCompletedPuzzleIds, allStoredPuzzles: allPuzzles });
	const incompletePuzzles = allPuzzles.filter((puzzle) => {
		return !allCompletedPuzzleIds.includes(puzzle.id);
	});

	console.log({ incompletePuzzles });
	const chosenPuzzle = incompletePuzzles[0]!;
	console.log({ puzzles: incompletePuzzles, chosenPuzzle });
	console.log({ puzzle: chosenPuzzle });
	return chosenPuzzle;
};
