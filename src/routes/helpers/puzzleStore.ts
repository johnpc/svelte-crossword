import { persisted } from 'svelte-persisted-store';
import type { Schema } from '../../../amplify/data/resource';
import type { HydratedProfile } from './types/types';

const defaultAllPuzzles = {} as { [profileId: string]: Schema['Puzzle'][] };
const defaultProfile = {} as { [profileId: string]: HydratedProfile };
const defaultUserPuzzles = {} as { [profileId: string]: Schema['UserPuzzle'][] };
const defaultLastUpdated = {} as { [profileId: string]: number };

export const puzzleStore = persisted('puzzles', {
	allPuzzles: defaultAllPuzzles,
	profile: defaultProfile,
	userPuzzles: defaultUserPuzzles,
	lastUpdated: defaultLastUpdated
});

export const resetPuzzleStoreDefaults = () => {
	puzzleStore.set({
		allPuzzles: defaultAllPuzzles,
		profile: defaultProfile,
		userPuzzles: defaultUserPuzzles,
		lastUpdated: defaultLastUpdated
	});
};
