import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import type {
	ConstructFactory,
	FunctionResources,
	ResourceProvider
} from '@aws-amplify/plugin-types';

const schema = a.schema({
	Profile: a
		.model({
			id: a.string().required(),
			userId: a.string().required(),
			name: a.string().required(),
			email: a.string().required(),
			completedPuzzles: a.hasMany('UserPuzzle')
		})
		.authorization([
			a.allow.owner(),
			a.allow.custom(),
			a.allow.private().to(['read']),
			a.allow.public('iam').to(['read'])
		]),
	UserPuzzle: a
		.model({
			profile: a.belongsTo('Profile'),
			puzzle: a.hasOne('Puzzle'),
			usedCheck: a.boolean().required(),
			usedReveal: a.boolean().required(),
			usedClear: a.boolean().required(),
			timeInSeconds: a.integer().required()
		})
		.authorization([
			a.allow.owner(),
			a.allow.custom(),
			a.allow.private().to(['read']),
			a.allow.public('iam').to(['read'])
		]),
	Puzzle: a
		.model({
			puzJson: a.json(),
			puzKey: a.string()
		})
		.authorization([a.allow.public('iam'), a.allow.private('userPools'), a.allow.custom()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = (authFunction: ConstructFactory<ResourceProvider<FunctionResources>>) =>
	defineData({
		schema,
		authorizationModes: {
			defaultAuthorizationMode: 'iam',
			lambdaAuthorizationMode: {
				function: authFunction,
				timeToLiveInSeconds: 300
			}
		}
	});
