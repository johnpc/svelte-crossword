import { fetchAuthSession } from 'aws-amplify/auth';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import config from '../../../amplify_outputs.json';
import type { Clue } from '../../helpers/types/types';

export type UserPuzzleData = {
	time_in_seconds: number;
	used_check: number;
	used_clear: number;
	used_reveal: number;
	puzzle_id: string;
};

export type FetchPuzzleResult = {
	userPuzzle: UserPuzzleData;
	clues: Clue[];
};

export const fetchPuzzleById = async (userPuzzleId: string): Promise<FetchPuzzleResult> => {
	const session = await fetchAuthSession();
	const lambda = new LambdaClient({
		region: 'us-west-2',
		credentials: session.credentials
	});

	const functionName = (config.custom as { sqlQueriesFunctionName?: string })
		?.sqlQueriesFunctionName;
	if (!functionName) {
		throw new Error('SQL queries function name not found in config');
	}

	const userPuzzleCommand = new InvokeCommand({
		FunctionName: functionName,
		Payload: JSON.stringify({ query: 'getUserPuzzle', userPuzzleId })
	});

	const userPuzzleResponse = await lambda.send(userPuzzleCommand);
	const userPuzzlePayload = JSON.parse(new TextDecoder().decode(userPuzzleResponse.Payload));
	const userPuzzle: UserPuzzleData = JSON.parse(userPuzzlePayload.body);

	const puzzleCommand = new InvokeCommand({
		FunctionName: functionName,
		Payload: JSON.stringify({ query: 'getPuzzle', puzzleId: userPuzzle.puzzle_id })
	});

	const puzzleResponse = await lambda.send(puzzleCommand);
	const puzzlePayload = JSON.parse(new TextDecoder().decode(puzzleResponse.Payload));
	const puzzle = JSON.parse(puzzlePayload.body);

	const jsonAtIndex = JSON.parse(puzzle.puz_json as string);
	const across = Object.values(jsonAtIndex.clues.across) as Clue[];
	const down = Object.values(jsonAtIndex.clues.down) as Clue[];

	return { userPuzzle, clues: [...across, ...down] };
};
