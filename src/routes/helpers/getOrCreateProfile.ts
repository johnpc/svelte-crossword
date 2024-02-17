import type { Schema } from '../../../amplify/data/resource';
import { getCurrentUser } from 'aws-amplify/auth';
import type { HydratedProfile } from './types/types';
import type { V6Client } from '@aws-amplify/api-graphql';

export const getOrCreateProfile = async (client: V6Client<Schema>): Promise<HydratedProfile> => {
	const currentUser = await getCurrentUser();
	const selectionSet = ['id', 'email', 'userId', 'name', 'completedPuzzles.*'] as readonly (
		| 'id'
		| 'email'
		| 'userId'
		| 'name'
		| 'completedPuzzles.*'
	)[];
	try {
		const getProfileResponse = await client.models.Profile.get(
			{
				id: currentUser.userId
			},
			{ selectionSet }
		);
		console.log({ getProfileResponse });
		if (getProfileResponse?.data?.id) {
			return getProfileResponse.data as HydratedProfile;
		}
	} catch (e) {
		console.warn(e);
	}
	const createProfileResponse = await client.models.Profile.create({
		id: currentUser.userId,
		userId: currentUser.userId,
		email: currentUser.signInDetails?.loginId as string,
		name: currentUser.signInDetails?.loginId || currentUser.username
	});
	console.log({ createProfileResponse });
	const hydratedProfile = await client.models.Profile.get(
		{
			id: currentUser.userId
		},
		{ selectionSet }
	);

	return hydratedProfile.data as HydratedProfile;
};
