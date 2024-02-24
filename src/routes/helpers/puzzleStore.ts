import { persisted } from 'svelte-persisted-store';
import type { Schema } from '../../../amplify/data/resource';
import type { HydratedProfile } from './types/types';

export const puzzleStore = persisted('puzzles', {
	allPuzzles: [] as Schema['Puzzle'][],
	profile: {} as HydratedProfile,
	userPuzzles: [] as Schema['UserPuzzle'][],
	lastUpdated: Date.now()
});
