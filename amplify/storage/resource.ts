import { defineStorage } from '@aws-amplify/backend';
import { seedPuzzleDbFunction } from '../backend';

export const storage = defineStorage({
	name: 'smallCrosswordsPuzFileStorage',
	access: (allow) => ({
		'internal/*': [allow.resource(seedPuzzleDbFunction).to(['read'])]
	})
});
