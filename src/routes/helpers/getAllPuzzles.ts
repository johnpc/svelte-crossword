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
export const getAllPuzzles = async (profile: HydratedProfile, bypassCache = false) => {
	console.log({ time: Date.now(), invoking: 'getAllPuzzles' });
	const store = get(puzzleStore);
	if (!bypassCache && store.allPuzzles[profile.id]) {
		console.log({ cachedAllPuzzles: store.allPuzzles[profile.id] });
		return store.allPuzzles[profile.id];
	}

	let nextToken;
	const puzzles = [] as Schema['Puzzle'][];
	do {
		const puzzleResponse: { data: Schema['Puzzle'][]; nextToken?: string | null | undefined } =
			await client.models.Puzzle.list({
				limit: 1000,
				nextToken
			});

		nextToken = puzzleResponse.nextToken;
		puzzles.push(...puzzleResponse.data);
	} while (nextToken);
	puzzles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	try {
		puzzleStore.set({
			...store,
			allPuzzles: { [profile.id]: puzzles }
		});
	} catch (e) {
		console.error('Failed to write to local storage', e);
	}

	return puzzles;
};
