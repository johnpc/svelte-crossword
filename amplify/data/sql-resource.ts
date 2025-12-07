import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

// This will be generated from your actual database schema
// Run: npx ampx generate schema-from-database --connection-uri-secret SQL_CONNECTION_STRING --out amplify/data/schema.sql.ts
// For now, this is a placeholder showing the expected structure

const sqlSchema = a
	.schema({
		Profile: a.model({
			id: a.id().required(),
			userId: a.string().required(),
			name: a.string().required(),
			email: a.string().required()
		}),

		Puzzle: a.model({
			id: a.id().required(),
			puzJson: a.json().required(),
			puzKey: a.string(),
			title: a.string(),
			author: a.string()
		}),

		UserPuzzle: a.model({
			id: a.id().required(),
			profileId: a.id().required(),
			puzzleId: a.id().required(),
			usedCheck: a.boolean().required(),
			usedReveal: a.boolean().required(),
			usedClear: a.boolean().required(),
			timeInSeconds: a.integer().required()
		})
	})
	.authorization((allow) => allow.authenticated());

export type SqlSchema = ClientSchema<typeof sqlSchema>;

export const sqlData = defineData({
	schema: sqlSchema,
	authorizationModes: {
		defaultAuthorizationMode: 'userPool'
	}
});
