import { defineFunction } from '@aws-amplify/backend';

export const generatePuzzleFunction = defineFunction({
	name: 'generatePuzzleFunction',
	entry: './handler.ts',
	runtime: 20,
	timeoutSeconds: 120,
	memoryMB: 512,
	schedule: 'every day'
});
