import type { Schema } from '../../../amplify/data/resource';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import type { HydratedProfile } from './types/types';
import type { V6Client } from '@aws-amplify/api-graphql';

export const getOrCreateProfile = async (client: V6Client<Schema>): Promise<HydratedProfile> => {
	const currentUser = await getCurrentUser();
	const userAttributes = await fetchUserAttributes();

	const selectionSet = ['id', 'email'] as readonly (
		| 'id'
		| 'email'
		| 'userId'
		| 'name'
		| 'completedPuzzles.*'
	)[];

	try {
		const getProfileResponse = await client.models.Profile.get(
			{ id: currentUser.userId },
			{ selectionSet }
		);
		if (getProfileResponse?.data?.id) {
			return getProfileResponse.data as HydratedProfile;
		}
	} catch (e) {
		console.warn(e);
	}

	const email = currentUser.signInDetails?.loginId || userAttributes.email || currentUser.username;
	const name =
		currentUser.signInDetails?.loginId ||
		userAttributes.name ||
		userAttributes.email ||
		currentUser.username;

	// Create in DynamoDB
	await client.models.Profile.create({
		id: currentUser.userId,
		userId: currentUser.userId,
		email,
		name
	});

	// Also create in SQL
	try {
		await client.models.SqlProfile.create({
			id: currentUser.userId,
			user_id: currentUser.userId,
			email,
			name
		});
	} catch (e) {
		console.log({ msg: 'SQL profile insert failed', error: e });
	}

	const hydratedProfile = await client.models.Profile.get(
		{ id: currentUser.userId },
		{ selectionSet }
	);

	return hydratedProfile.data as HydratedProfile;
};
