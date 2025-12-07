import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { CrosswordClues } from '../types/types';

export const getNextPuzzle = async (profileId: string): Promise<CrosswordClues> => {
	const session = await fetchAuthSession();
	const lambda = new LambdaClient({
		region: 'us-west-2',
		credentials: session.credentials
	});

	const command = new InvokeCommand({
		FunctionName: 'sql-queries',
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
