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

	const grid = generateUniqueGrid(deps.words);
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
