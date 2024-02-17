import type { Schema } from '../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { getAllUserPuzzles } from './getAllUserPuzzles';
import type { Clue, CrosswordClues } from './types/types';
const client = generateClient<Schema>({
	authMode: 'userPool'
});

const globalCache = {
	allPuzzles: [] as Schema['Puzzle'][],
	allCompletedPuzzleIds: [] as string[]
};

const getCompletedPuzzleIds = async (profile: Schema['Profile']): Promise<string[]> => {
	// Unfortunately, this only contains 100 puzzles :(
	// const maybe = profile.completedPuzzles.map(completedPuzzle => completedPuzzle.userPuzzlePuzzleId)
	// console.log({maybe});

	const completedPuzzles = await getAllUserPuzzles(profile);
	const completedPuzzleIdPromises = completedPuzzles.map(async (completedPuzzle) => {
		const puzzle = await completedPuzzle.puzzle();
		return puzzle.data!.id;
	});

	const completedPuzzleIds = await Promise.all(completedPuzzleIdPromises);
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
	if (!globalCache.allCompletedPuzzleIds.length) {
		globalCache.allCompletedPuzzleIds = await getCompletedPuzzleIds(profile);
	}

	if (!globalCache.allPuzzles.length) {
		const puzzleResponse = await client.models.Puzzle.list({
			limit: 10000
		});
		console.log({ puzzleResponse });

		globalCache.allPuzzles = puzzleResponse.data.filter((puzzle) => {
			return !globalCache.allCompletedPuzzleIds.includes(puzzle.id);
		});
	}

	console.log({ globalCache });

	const chosenPuzzle = globalCache.allPuzzles.pop()!;

	console.log({ puzzles: globalCache.allPuzzles, chosenPuzzle });
	const clues = getCluesFromPuzzle(chosenPuzzle);
	console.log({ clues, puzzle: chosenPuzzle });
	return {
		id: chosenPuzzle.id,
		clues
	};
};
