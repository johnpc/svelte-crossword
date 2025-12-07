import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import type {
	ConstructFactory,
	FunctionResources,
	ResourceProvider
} from '@aws-amplify/plugin-types';
import { seedPuzzleDbFunction } from '../function/resource';
import { schema as generatedSqlSchema } from './schema.sql';

// DynamoDB schema (existing)
const ddbSchema = a
	.schema({
		Profile: a
			.model({
				id: a.string().required(),
				userId: a.string().required(),
				name: a.string().required(),
				email: a.string().required(),
				completedPuzzles: a.hasMany('UserPuzzle', 'profileCompletedPuzzlesId')
			})
			.authorization((allow) => [
				allow.owner(),
				allow.custom(),
				allow.authenticated('identityPool').to(['read']),
				allow.authenticated().to(['read']),
				allow.guest().to(['read'])
			]),
		UserPuzzle: a
			.model({
				profile: a.belongsTo('Profile', 'profileCompletedPuzzlesId'),
				profileCompletedPuzzlesId: a.string().required(),
				puzzle: a.belongsTo('Puzzle', 'userPuzzlePuzzleId'),
				userPuzzlePuzzleId: a.string().required(),
				usedCheck: a.boolean().required(),
				usedReveal: a.boolean().required(),
				usedClear: a.boolean().required(),
				timeInSeconds: a.integer().required()
			})
			.authorization((allow) => [
				allow.owner(),
				allow.custom(),
				allow.authenticated().to(['read']),
				allow.authenticated('identityPool').to(['read']),
				allow.guest().to(['read'])
			]),
		Puzzle: a
			.model({
				puzJson: a.json(),
				puzKey: a.string(),
				userPuzzles: a.hasMany('UserPuzzle', 'userPuzzlePuzzleId')
			})
			.authorization((allow) => [
				allow.custom(),
				allow.authenticated().to(['read']),
				allow.authenticated('identityPool').to(['read']),
				allow.guest().to(['read'])
			])
	})
	.authorization((allow) => allow.resource(seedPuzzleDbFunction).to(['query', 'mutate', 'listen']));

// SQL schema with authorization
const sqlSchema = generatedSqlSchema.authorization((allow) => [
	allow.authenticated().to(['read']),
	allow.guest().to(['read'])
]);

// Combine both schemas
const combinedSchema = a.combine([ddbSchema, sqlSchema]);

export type Schema = ClientSchema<typeof combinedSchema>;

export const data = (authFunction: ConstructFactory<ResourceProvider<FunctionResources>>) =>
	defineData({
		schema: combinedSchema,
		authorizationModes: {
			defaultAuthorizationMode: 'iam',
			lambdaAuthorizationMode: {
				function: authFunction,
				timeToLiveInSeconds: 300
			}
		}
	});
