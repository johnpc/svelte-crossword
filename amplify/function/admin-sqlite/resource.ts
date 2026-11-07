import { defineFunction } from '@aws-amplify/backend';

export const adminSqliteFunction = defineFunction({
	name: 'admin-sqlite',
	entry: './handler.ts',
	// node:sqlite ships with Node 22, so no native module build is needed.
	runtime: 22,
	timeoutSeconds: 60
});
