import type { Schema } from '../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { getAllUserPuzzles } from './getAllUserPuzzles';
import type { Clue, CrosswordClues } from './types/types';
import { puzzleStore } from './puzzleStore';
import { get } from 'svelte/store';

const client = generateClient<Schema>({
	authMode: 'userPool'
});

const getCompletedPuzzleIds = async (profile: Schema['Profile']): Promise<string[]> => {
	// Unfortunately, this only contains 100 puzzles :(
	// const maybe = profile.completedPuzzles.map(completedPuzzle => completedPuzzle.userPuzzlePuzzleId)
	// console.log({maybe});

	const completedPuzzles = await getAllUserPuzzles(profile);
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

export const getNextPuzzle = async (profile: Schema['Profile']): Promise<CrosswordClues> => {
	const allCompletedPuzzleIds = await getCompletedPuzzleIds(profile);
	const store = get(puzzleStore);
	if (!store.allPuzzles.length) {
		const puzzleResponse = await client.models.Puzzle.list({
			limit: 10000
		});
		console.log({ puzzleResponse });
		puzzleStore.set({
			...store,
			allPuzzles: { [profile.id]: puzzleResponse.data }
		});
	}

	const incompletePuzzles = store.allPuzzles[profile.id].filter((puzzle) => {
		return !allCompletedPuzzleIds.includes(puzzle.id);
	});

	const chosenPuzzle = incompletePuzzles[0]!;
	console.log({ puzzles: incompletePuzzles, chosenPuzzle });
	const clues = getCluesFromPuzzle(chosenPuzzle);
	console.log({ clues, puzzle: chosenPuzzle });
	return {
		id: chosenPuzzle.id,
		clues
	};
};
