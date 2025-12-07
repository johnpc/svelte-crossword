import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { CrosswordClues } from '../types/types';
import config from '../../../amplify_outputs.json';

export const getNextPuzzle = async (profileId: string): Promise<CrosswordClues> => {
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

	const command = new InvokeCommand({
		FunctionName: functionName,
		Payload: JSON.stringify({ query: 'nextPuzzle', profileId })
	});

	const response = await lambda.send(command);
	const payload = JSON.parse(new TextDecoder().decode(response.Payload));
	const puzzle = JSON.parse(payload.body);

	if (!puzzle) {
		throw new Error('No puzzles available');
	}

	return JSON.parse(puzzle.puzJson);
};
