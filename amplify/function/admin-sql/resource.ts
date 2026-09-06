import { defineFunction } from '@aws-amplify/backend';

export const adminSqlFunction = defineFunction({
	name: 'admin-sql',
	entry: './handler.ts',
	timeoutSeconds: 60
});
