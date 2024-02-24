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
const client = generateClient<Schema>({
	authMode: 'iam'
});
const store = get(puzzleStore);
const storeShouldBeUpdated = () => {
	const storeIsSet = !!store.lastUpdated && store.allPuzzles.length > 0;
	const moreThanADaySinceUpdate = store.lastUpdated < Date.now() - 3600 * 1000;
	return storeIsSet && moreThanADaySinceUpdate;
};
const maybeUpdateStore = async () => {
	if (!storeShouldBeUpdated()) {
		return;
	}
	const puzzleResponse = await client.models.Puzzle.list({
		limit: 10000
	});
	console.log({ puzzleResponse });
	puzzleStore.set({
		...store,
		allPuzzles: puzzleResponse.data
	});
};
maybeUpdateStore();
