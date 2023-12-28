import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
	Profile: a
		.model({
			id: a.string().required(),
			userId: a.string().required(),
			name: a.string().required(),
			email: a.string().required(),
			completedPuzzles: a.hasMany('Puzzle')
		})
		.authorization([a.allow.owner(), a.allow.custom()]),
	Puzzle: a
		.model({
			puzJson: a.json(),
			puzKey: a.string()
		})
		.authorization([a.allow.public('iam'), a.allow.private('userPools'), a.allow.custom()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = (authFunction: any) =>
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
