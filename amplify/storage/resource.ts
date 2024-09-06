import { defineStorage } from '@aws-amplify/backend';
import { seedPuzzleDbFunction } from '../function/resource';

export const storage = defineStorage({
	name: 'smallCrosswordsPuzFileStorage',
	access: (allow) => ({
		'internal/*': [allow.resource(seedPuzzleDbFunction).to(['read', 'write'])]
	})
});
