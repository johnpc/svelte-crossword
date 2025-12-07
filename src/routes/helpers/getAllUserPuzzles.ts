import type { Schema } from '../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import config from '../../amplify_outputs.json';
import type { HydratedProfile, HydratedUserPuzzle } from './types/types';

Amplify.configure(config);
const client = generateClient<Schema>({ authMode: 'iam' });

export const getAllUserPuzzles = async (
	profile: HydratedProfile
): Promise<HydratedUserPuzzle[]> => {
	const selectionSet = [
		'id',
		'profileCompletedPuzzlesId',
		'timeInSeconds',
		'usedCheck',
		'usedClear',
		'usedReveal',
		'userPuzzlePuzzleId',
		'createdAt'
	] as readonly (
		| 'id'
		| 'profileCompletedPuzzlesId'
		| 'usedCheck'
		| 'usedClear'
		| 'usedReveal'
		| 'userPuzzlePuzzleId'
		| 'createdAt'
	)[];

	let nextToken;
	const completedPuzzleIds: string[] = [];
	const userPuzzles = [] as HydratedUserPuzzle[];

	do {
		const completedPuzzlesResponse = (await client.models.UserPuzzle.list({
			filter: {
				profileCompletedPuzzlesId: {
					eq: profile.id
				}
			},
			selectionSet,
			limit: 10000,
			nextToken
		})) as {
			nextToken: string | undefined;
			data: HydratedUserPuzzle[];
		};
		nextToken = completedPuzzlesResponse.nextToken;
		const rawUserPuzzles = completedPuzzlesResponse.data.length
			? completedPuzzlesResponse.data
			: [];
		for (const rawUserPuzzle of rawUserPuzzles) {
			if (completedPuzzleIds.includes(rawUserPuzzle.userPuzzlePuzzleId!)) {
				continue;
			}
			completedPuzzleIds.push(rawUserPuzzle.userPuzzlePuzzleId!);
			userPuzzles.push(rawUserPuzzle);
		}
	} while (nextToken);

	userPuzzles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	return userPuzzles;
};
