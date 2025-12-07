import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import config from '../../../amplify_outputs.json';

Amplify.configure(config);

export type UserHistoryEntry = {
	id: string;
	profileId: string;
	puzzleId: string;
	usedCheck: boolean;
	usedReveal: boolean;
	usedClear: boolean;
	timeInSeconds: number;
	createdAt: string;
	puzzleTitle?: string;
	puzzleAuthor?: string;
};

export const getUserHistory = async (profileId: string): Promise<UserHistoryEntry[]> => {
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
		Payload: JSON.stringify({ query: 'getUserHistory', profileId })
	});

	const response = await lambda.send(command);
	const payload = JSON.parse(new TextDecoder().decode(response.Payload));
	const rows = JSON.parse(payload.body);

	return rows.map(
		(row: {
			id: string;
			profile_id: string;
			puzzle_id: string;
			used_check: number;
			used_reveal: number;
			used_clear: number;
			time_in_seconds: number;
			created_at: string;
			title?: string;
			author?: string;
		}) => ({
			id: row.id,
			profileId: row.profile_id,
			puzzleId: row.puzzle_id,
			usedCheck: Boolean(row.used_check),
			usedReveal: Boolean(row.used_reveal),
			usedClear: Boolean(row.used_clear),
			timeInSeconds: row.time_in_seconds,
			createdAt: row.created_at,
			puzzleTitle: row.title || undefined,
			puzzleAuthor: row.author || undefined
		})
	);
};
