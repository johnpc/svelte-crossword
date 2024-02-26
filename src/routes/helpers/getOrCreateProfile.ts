import type { Schema } from '../../../amplify/data/resource';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import type { HydratedProfile } from './types/types';
import type { V6Client } from '@aws-amplify/api-graphql';
import { puzzleStore } from './puzzleStore';
import { get } from 'svelte/store';

export const getOrCreateProfile = async (
	client: V6Client<Schema>,
	bypassCache = false
): Promise<HydratedProfile> => {
	console.log({ time: Date.now(), invoking: 'getOrCreateProfile' });
	const store = get(puzzleStore);
	const currentUser = await getCurrentUser();
	const userAttributes = await fetchUserAttributes();
	if (
		!bypassCache &&
		store.profile[currentUser.userId]?.id &&
		store.profile[currentUser.userId]?.email
	) {
		console.log({ cachedProfile: store.profile[currentUser.userId] });
		return store.profile[currentUser.userId];
	}

	const selectionSet = ['id', 'email'] as readonly (
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
			try {
				puzzleStore.set({
					...store,
					profile: { [getProfileResponse.data.id]: getProfileResponse.data as HydratedProfile }
				});
			} catch (e) {
				console.error('Failed to write to local storage', e);
			}

			return getProfileResponse.data as HydratedProfile;
		}
	} catch (e) {
		console.warn(e);
	}
	const createProfileResponse = await client.models.Profile.create({
		id: currentUser.userId,
		userId: currentUser.userId,
		email: currentUser.signInDetails?.loginId || userAttributes.email || currentUser.username,
		name:
			currentUser.signInDetails?.loginId ||
			userAttributes.name ||
			userAttributes.email ||
			currentUser.username
	});
	console.log({ createProfileResponse });
	const hydratedProfile = await client.models.Profile.get(
		{
			id: currentUser.userId
		},
		{ selectionSet }
	);

	const profile = hydratedProfile.data as HydratedProfile;
	try {
		puzzleStore.set({
			...store,
			profile: {
				[profile.id]: profile
			}
		});
	} catch (e) {
		console.error('Failed to write to local storage', e);
	}

	return profile;
};
