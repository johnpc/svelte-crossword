import type { Schema } from '../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import config from '../../amplifyconfiguration.json';

Amplify.configure(config);
const client = generateClient<Schema>({
	authMode: 'iam'
});
export const getAllUserPuzzles = async (profile: Schema['Profile']) => {
	let nextToken;
	const userPuzzles = [] as Schema['UserPuzzle'][];
	do {
		const completedPuzzlesResponse = (await client.models.UserPuzzle.list({
			filter: {
				profileCompletedPuzzlesId: {
					eq: profile.userId
				}
			},
			nextToken
		})) as {
			nextToken: string | undefined;
			data: Schema['UserPuzzle'][];
		};
		nextToken = completedPuzzlesResponse.nextToken;
		userPuzzles.push(...completedPuzzlesResponse.data);
	} while (nextToken);
	return userPuzzles;
};
