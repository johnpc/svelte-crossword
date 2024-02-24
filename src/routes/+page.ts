// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true;
import { Amplify } from 'aws-amplify';
import config from '../amplifyconfiguration.json';
Amplify.configure(config);
import { puzzleStore } from './helpers/puzzleStore';
import { get } from 'svelte/store';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import { getCurrentUser, type AuthUser } from 'aws-amplify/auth';
const client = generateClient<Schema>({
	authMode: 'iam'
});
const store = get(puzzleStore);
const storeShouldBeUpdated = (profileId: string) => {
	const storeIsSet = !!store.lastUpdated[profileId] && store.allPuzzles[profileId].length > 0;
	const moreThanADaySinceUpdate = store.lastUpdated[profileId] < Date.now() - 3600 * 1000;
	return storeIsSet && moreThanADaySinceUpdate;
};
const maybeUpdateStore = async () => {
	let currentUser: AuthUser;
	try {
		currentUser = await getCurrentUser();
	} catch {
		return;
	}
	if (!storeShouldBeUpdated(currentUser.userId)) {
		return;
	}
	const puzzleResponse = await client.models.Puzzle.list({
		limit: 10000
	});
	console.log({ puzzleResponse });
	puzzleStore.set({
		...store,
		allPuzzles: { [currentUser.userId]: puzzleResponse.data }
	});
};
maybeUpdateStore();
