import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fetchAuthSession, fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import config from '../../../amplify_outputs.json';

Amplify.configure(config);

export const getOrCreateProfile = async () => {
	const currentUser = await getCurrentUser();
	const userAttributes = await fetchUserAttributes();
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

	// Try to get existing profile
	const getCommand = new InvokeCommand({
		FunctionName: functionName,
		Payload: JSON.stringify({ query: 'getProfile', userId: currentUser.userId })
	});

	const getResponse = await lambda.send(getCommand);
	const getPayload = JSON.parse(new TextDecoder().decode(getResponse.Payload));
	const existing = JSON.parse(getPayload.body);

	if (existing) {
		return existing;
	}

	// Create new profile
	const email = currentUser.signInDetails?.loginId || userAttributes.email || currentUser.username;
	const name =
		currentUser.signInDetails?.loginId ||
		userAttributes.name ||
		userAttributes.email ||
		currentUser.username;

	const createCommand = new InvokeCommand({
		FunctionName: functionName,
		Payload: JSON.stringify({ query: 'createProfile', userId: currentUser.userId, email, name })
	});

	const createResponse = await lambda.send(createCommand);
	const createPayload = JSON.parse(new TextDecoder().decode(createResponse.Payload));
	return JSON.parse(createPayload.body);
};
