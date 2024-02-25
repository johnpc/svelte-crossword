import { persisted } from 'svelte-persisted-store';
import type { Schema } from '../../../amplify/data/resource';
import type { HydratedProfile, HydratedUserPuzzle } from './types/types';

const defaultAllPuzzles = {} as { [profileId: string]: Schema['Puzzle'][] };
const defaultProfile = {} as { [profileId: string]: HydratedProfile };
const defaultUserPuzzles = {} as { [profileId: string]: HydratedUserPuzzle[] };
const defaultLastUpdated = {} as { [profileId: string]: number };

export const puzzleStore = persisted('puzzles', {
	allPuzzles: defaultAllPuzzles,
	profile: defaultProfile,
	userPuzzles: defaultUserPuzzles,
	lastUpdated: defaultLastUpdated
});

export const resetPuzzleStoreDefaults = () => {
	try {
		puzzleStore.set({
			allPuzzles: defaultAllPuzzles,
			profile: defaultProfile,
			userPuzzles: defaultUserPuzzles,
			lastUpdated: defaultLastUpdated
		});
	} catch (e) {
		console.error('Failed to write to local storage', e);
	}
};
