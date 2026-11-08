import { defineFunction } from '@aws-amplify/backend';

export const backupSqliteFunction = defineFunction({
	name: 'backup-sqlite',
	entry: './handler.ts',
	runtime: 22,
	timeoutSeconds: 120,
	memoryMB: 512,
	schedule: 'every day'
});
