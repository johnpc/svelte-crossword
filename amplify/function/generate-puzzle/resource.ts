import { defineFunction } from '@aws-amplify/backend';

export const generatePuzzleFunction = defineFunction({
	name: 'generatePuzzleFunction',
	entry: './handler.ts',
	runtime: 20,
	timeoutSeconds: 600,
	memoryMB: 2048,
	schedule: 'every day'
});
