import { LambdaClient } from '@aws-sdk/client-lambda';
import { generateClues } from './clue-generator';
import wordList from './word-list.json';
import { createSqlInvoker, SqlInvoker } from './sql-invoker';
import {
	buildPuzzleJson,
	generateUniqueGrid,
	puzzleIdFor,
	todayDateString
} from './puzzle-builder';

export interface GeneratePuzzleEvent {
	dryRun?: boolean;
	date?: string;
	/**
	 * If true, the generator rejects all-white grids and only returns puzzles
	 * with corner black squares (and therefore 4-letter slots). Useful for
	 * deliberately producing a black-square puzzle to verify the front-end
	 * handles them correctly.
	 */
	forceBlackSquares?: boolean;
}

export interface HandlerDeps {
	invokeSql: SqlInvoker;
	generateClues: typeof generateClues;
	region: string;
	words: string[];
}

const lambda = new LambdaClient({ region: process.env.AWS_REGION });

const defaultDeps: HandlerDeps = {
	invokeSql: createSqlInvoker(lambda, process.env.SQL_QUERIES_FUNCTION_NAME ?? ''),
	generateClues,
	region: process.env.AWS_REGION ?? '',
	words: wordList
};

export async function runHandler(event: GeneratePuzzleEvent, deps: HandlerDeps) {
	const dryRun = event.dryRun === true;
	const dateStr = event.date || todayDateString();
	const puzzleId = puzzleIdFor(dateStr);

	if (!dryRun) {
		const checkResult = await deps.invokeSql({ query: 'getPuzzle', puzzleId });
		if (JSON.parse(checkResult)) return { skipped: true, puzzleId };
	}

	const grid = generateUniqueGrid(deps.words, {
		requireBlackSquares: event.forceBlackSquares === true
	});
	if (!grid) throw new Error('Failed to generate a valid grid after 10 attempts');

	const clues = await deps.generateClues(grid.across, grid.down, deps.region);
	const puzJson = buildPuzzleJson(grid, clues);

	if (dryRun) return { dryRun: true, puzzleId, puzJson };

	await deps.invokeSql({
		query: 'createPuzzle',
		puzzle: {
			id: puzzleId,
			puz_json: JSON.stringify(puzJson),
			puz_key: puzzleId,
			title: puzJson.header.title,
			author: puzJson.header.author
		}
	});
	return { success: true, puzzleId, title: puzJson.header.title };
}

export const handler = async (event: GeneratePuzzleEvent) => {
	console.log(`EVENT: ${JSON.stringify(event)}`);
	return runHandler(event, defaultDeps);
};
