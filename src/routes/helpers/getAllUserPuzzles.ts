import type { Schema } from '../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import config from '../../amplifyconfiguration.json';
import { puzzleStore } from './puzzleStore';
import { get } from 'svelte/store';
import type { HydratedProfile } from './types/types';

Amplify.configure(config);
const client = generateClient<Schema>({
	authMode: 'iam'
});
export const getAllUserPuzzles = async (profile: HydratedProfile) => {
	const store = get(puzzleStore);
	if (store.userPuzzles[profile.id]?.length > 0) {
		console.log({ cachedUserPuzzles: store.userPuzzles[profile.id] });
		return store.userPuzzles[profile.id];
	}

	let nextToken;
	const completedPuzzleIds: string[] = [];
	const userPuzzles = [] as Schema['UserPuzzle'][];
	do {
		const completedPuzzlesResponse = (await client.models.UserPuzzle.list({
			filter: {
				profileCompletedPuzzlesId: {
					eq: profile.id
				}
			},
			limit: 1000,
			nextToken
		})) as {
			nextToken: string | undefined;
			data: Schema['UserPuzzle'][];
		};
		nextToken = completedPuzzlesResponse.nextToken;
		const rawUserPuzzles = completedPuzzlesResponse.data;
		for (const rawUserPuzzle of rawUserPuzzles) {
			if (completedPuzzleIds.includes(rawUserPuzzle.userPuzzlePuzzleId!)) {
				continue;
			}
			completedPuzzleIds.push(rawUserPuzzle.userPuzzlePuzzleId!);
			userPuzzles.push(rawUserPuzzle);
		}
	} while (nextToken);
	userPuzzles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	puzzleStore.set({
		...store,
		userPuzzles: { [profile.id]: userPuzzles }
	});
	return userPuzzles;
};
