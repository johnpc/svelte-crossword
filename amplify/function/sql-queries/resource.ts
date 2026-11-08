import { defineFunction } from '@aws-amplify/backend';

export const sqlQueriesFunction = defineFunction({
	name: 'sql-queries',
	entry: './handler.ts',
	// node:sqlite ships with Node 22, so no native module build is needed.
	runtime: 22,
	timeoutSeconds: 30
});
