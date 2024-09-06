import { defineFunction } from '@aws-amplify/backend';

export const seedPuzzleDbFunction = defineFunction({
	name: 'seedPuzzleDbFunction',
	entry: './build-puzzle-collection.ts',
	runtime: 20,
	timeoutSeconds: 600,
	memoryMB: 1024,
	schedule: 'every day'
});
