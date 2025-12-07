import { defineFunction } from '@aws-amplify/backend';

export const sqlQueriesFunction = defineFunction({
	name: 'sql-queries',
	entry: './handler.ts',
	timeoutSeconds: 30
});
