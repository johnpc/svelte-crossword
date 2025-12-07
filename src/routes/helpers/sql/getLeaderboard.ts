import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fetchAuthSession } from 'aws-amplify/auth';
import config from '../../../amplify_outputs.json';

export type LeaderboardEntry = {
	id: string;
	name: string;
	email: string;
	completedCount: number;
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
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
		Payload: JSON.stringify({ query: 'leaderboard' })
	});

	const response = await lambda.send(command);
	const payload = JSON.parse(new TextDecoder().decode(response.Payload));
	return JSON.parse(payload.body);
};
