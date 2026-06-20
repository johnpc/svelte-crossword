import { generateGrid } from './grid-generator';
import { generateClues } from './clue-generator';
import { formatPuzzle } from './format-puzzle';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import wordList from './word-list.json';

const lambda = new LambdaClient({ region: process.env.AWS_REGION });

interface GeneratePuzzleEvent {
	dryRun?: boolean;
	date?: string;
}

export const handler = async (event: GeneratePuzzleEvent) => {
	console.log(`EVENT: ${JSON.stringify(event)}`);
	const dryRun = event.dryRun === true;
	const dateStr = event.date || new Date().toISOString().split('T')[0];
	const puzzleId = `generated-${dateStr}`;

	console.log({ dryRun, dateStr, puzzleId, wordCount: wordList.length });

	// Check for existing puzzle with this ID (dedup by date)
	if (!dryRun) {
		const checkResult = await invokeSql({
			query: 'getPuzzle',
			puzzleId
		});
		const existing = JSON.parse(checkResult);
		if (existing) {
			console.log(`Puzzle ${puzzleId} already exists, skipping`);
			return { skipped: true, puzzleId };
		}
	}

	// Generate grid with dedup check
	let grid = null;
	const seenSolutions = new Set<string>();

	for (let attempt = 0; attempt < 10; attempt++) {
		const candidate = generateGrid(wordList);
		if (!candidate) continue;
		if (seenSolutions.has(candidate.solution)) continue;
		seenSolutions.add(candidate.solution);
		grid = candidate;
		break;
	}

	if (!grid) {
		throw new Error('Failed to generate a valid grid after 10 attempts');
	}

	console.log({
		grid: {
			across: grid.across,
			down: grid.down,
			solution: grid.solution
		}
	});

	// Generate themed clues via Bedrock
	const clues = await generateClues(grid.across, grid.down, process.env.AWS_REGION!);
	console.log({ clues });

	// Format into puz_json structure
	const puzJson = formatPuzzle(grid, clues);
	console.log({ title: puzJson.header.title, author: puzJson.header.author });

	if (dryRun) {
		console.log('DRY RUN — not writing to database');
		console.log(JSON.stringify(puzJson, null, 2));
		return { dryRun: true, puzzleId, puzJson };
	}

	// Write to SQL via sqlQueriesFunction
	await invokeSql({
		query: 'createPuzzle',
		puzzle: {
			id: puzzleId,
			puz_json: JSON.stringify(puzJson),
			puz_key: puzzleId,
			title: puzJson.header.title,
			author: puzJson.header.author
		}
	});

	console.log(`Successfully created puzzle ${puzzleId}`);
	return { success: true, puzzleId, title: puzJson.header.title };
};

async function invokeSql(payload: Record<string, unknown>): Promise<string> {
	const command = new InvokeCommand({
		FunctionName: process.env.SQL_QUERIES_FUNCTION_NAME,
		Payload: JSON.stringify(payload)
	});
	const response = await lambda.send(command);
	const result = new TextDecoder().decode(response.Payload);
	const parsed = JSON.parse(result);
	return parsed.body || 'null';
}
