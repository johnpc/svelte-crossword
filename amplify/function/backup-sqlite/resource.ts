import { defineFunction } from '@aws-amplify/backend';

export const backupSqliteFunction = defineFunction({
	name: 'backup-sqlite',
	entry: './handler.ts',
	runtime: 22,
	timeoutSeconds: 120,
	memoryMB: 512,
	schedule: 'every day',
	// Lives in the storage nested stack: backend.ts grants the bucket and passes
	// its name as a plain env var, and the storage stack already depends on the
	// function stack (seedPuzzleDbFunction access rule), so doing that from the
	// function stack would be a nested-stack cycle.
	resourceGroupName: 'storage'
});
