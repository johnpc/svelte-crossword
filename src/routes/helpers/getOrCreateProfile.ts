import type { Schema } from '../../../amplify/data/resource';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import type { HydratedProfile } from './types/types';
import type { V6Client } from '@aws-amplify/api-graphql';

export const getOrCreateProfile = async (client: V6Client<Schema>): Promise<HydratedProfile> => {
	const currentUser = await getCurrentUser();
	const userAttributes = await fetchUserAttributes();

	try {
		const getProfileResponse = await client.models.SqlProfile.get({ id: currentUser.userId });
		if (getProfileResponse?.data?.id) {
			return {
				id: getProfileResponse.data.id,
				email: getProfileResponse.data.email
			};
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

	await client.models.SqlProfile.create({
		id: currentUser.userId,
		user_id: currentUser.userId,
		email,
		name
	});

	return {
		id: currentUser.userId,
		email
	};
};
