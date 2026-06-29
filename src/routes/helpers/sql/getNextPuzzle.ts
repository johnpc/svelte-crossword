import type { Clue, CrosswordClues } from '../types/types';
import { invokeSqlQuery } from './invokeSqlQuery';

type RawPuzzle = { id: string; puzJson: string | object };

export const getNextPuzzle = async (profileId: string): Promise<CrosswordClues | null> => {
	const puzzleData = await invokeSqlQuery<RawPuzzle | null>({ query: 'nextPuzzle', profileId });
	// Server returns null when there's no valid unplayed puzzle (catalog
	// exhausted, or only corrupt rows remain). Surface it as "no puzzle" rather
	// than crashing on a missing puzJson.
	if (!puzzleData || puzzleData.puzJson == null) return null;
	const puzData =
		typeof puzzleData.puzJson === 'string' ? JSON.parse(puzzleData.puzJson) : puzzleData.puzJson;

	const clues = [
		...Object.values(puzData.clues.across),
		...Object.values(puzData.clues.down)
	] as Clue[];

	return {
		id: puzzleData.id,
		clues,
		title: puzData.header.title,
		author: puzData.header.author
	};
};
