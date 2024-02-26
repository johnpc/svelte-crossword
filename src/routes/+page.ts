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
import { getAllUserPuzzles } from './helpers/getAllUserPuzzles';
import { getOrCreateProfile } from './helpers/getOrCreateProfile';
import { getAllPuzzles } from './helpers/getAllPuzzles';
const client = generateClient<Schema>({
	authMode: 'userPool'
});
const store = get(puzzleStore);
const storeShouldBeUpdated = async () => {
	let currentUser: AuthUser;
	try {
		currentUser = await getCurrentUser();
	} catch {
		return;
	}

	const storeIsSet = !!store.lastUpdated[currentUser.userId] && store.allPuzzles?.length > 0;
	const moreThanADaySinceUpdate = store.lastUpdated[currentUser.userId] < Date.now() - 3600 * 1000;
	return storeIsSet && moreThanADaySinceUpdate;
};

/**
 * Periodically keep local state up to date with db, in the background.
 */
const maybeUpdateStore = async () => {
	if (!(await storeShouldBeUpdated())) {
		return;
	}

	const profile = await getOrCreateProfile(client, true);
	const userPuzzles = await getAllUserPuzzles(profile, true);
	const puzzles = await getAllPuzzles(profile, true);
	try {
		puzzleStore.set({
			...store,
			profile: { [profile.id]: profile },
			userPuzzles: { [profile.id]: userPuzzles },
			allPuzzles: puzzles,
			lastUpdated: { [profile.id]: Date.now() }
		});
	} catch (e) {
		console.error('Failed to write to local storage', e);
	}
};
maybeUpdateStore();
