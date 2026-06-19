import type { CrosswordClues } from '../types/types';
import { invokeSqlQuery } from './invokeSqlQuery';

type RawPuzzle = { id: string; puzJson: string | object };

export const getNextPuzzle = async (profileId: string): Promise<CrosswordClues> => {
	const puzzleData = await invokeSqlQuery<RawPuzzle>({ query: 'nextPuzzle', profileId });
	const puzData =
		typeof puzzleData.puzJson === 'string' ? JSON.parse(puzzleData.puzJson) : puzzleData.puzJson;

	const clues = [...Object.values(puzData.clues.across), ...Object.values(puzData.clues.down)];

	return {
		id: puzzleData.id,
		clues,
		title: puzData.header.title,
		author: puzData.header.author
	};
};
