import type { Schema } from '../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { getAllUserPuzzles } from './getAllUserPuzzles';
import type { Clue, CrosswordClues, HydratedProfile } from './types/types';
import { puzzleStore } from './puzzleStore';
import { get } from 'svelte/store';

const client = generateClient<Schema>({
	authMode: 'userPool'
});

const getCompletedPuzzleIds = async (profile: HydratedProfile): Promise<string[]> => {
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

export const getNextPuzzle = async (profile: HydratedProfile): Promise<CrosswordClues> => {
	const allCompletedPuzzleIds = await getCompletedPuzzleIds(profile);
	let store = get(puzzleStore);
	if (!store.allPuzzles[profile.id]?.length) {
		const puzzleResponse = await client.models.Puzzle.list({
			limit: 10000
		});
		console.log({ puzzleResponse });
		puzzleStore.set({
			...store,
			allPuzzles: { [profile.id]: puzzleResponse.data }
		});
		store = get(puzzleStore);
	}

	console.log({ allCompletedPuzzleIds, storedPuzzles: store.allPuzzles[profile.id] });
	const incompletePuzzles = store.allPuzzles[profile.id].filter((puzzle) => {
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
