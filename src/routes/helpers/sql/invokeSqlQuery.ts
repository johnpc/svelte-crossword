import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import config from '../../../amplify_outputs.json';

Amplify.configure(config);

const REGION = 'us-west-2';

export const getSqlFunctionName = (): string => {
	const name = (config.custom as { sqlQueriesFunctionName?: string })?.sqlQueriesFunctionName;
	if (!name) throw new Error('SQL queries function name not found in config');
	return name;
};

export const invokeSqlQuery = async <T = unknown>(payload: Record<string, unknown>): Promise<T> => {
	const functionName = getSqlFunctionName();
	const session = await fetchAuthSession();
	const lambda = new LambdaClient({ region: REGION, credentials: session.credentials });
	const command = new InvokeCommand({
		FunctionName: functionName,
		Payload: JSON.stringify(payload)
	});
	const response = await lambda.send(command);
	const text = response.Payload ? new TextDecoder().decode(response.Payload) : '';
	if (text === 'undefined') throw new Error('Lambda returned empty response');
	if (!text) return undefined as T;
	const parsed = JSON.parse(text);
	if (parsed.errorMessage) throw new Error(`Lambda error: ${parsed.errorMessage}`);
	return typeof parsed.body === 'string' ? JSON.parse(parsed.body) : parsed.body;
};
