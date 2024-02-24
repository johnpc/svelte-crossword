import type { Schema } from '../../../amplify/data/resource';
import { getCurrentUser } from 'aws-amplify/auth';
import type { HydratedProfile } from './types/types';
import type { V6Client } from '@aws-amplify/api-graphql';
import { puzzleStore } from './puzzleStore';
import { get } from 'svelte/store';

export const getOrCreateProfile = async (
	client: V6Client<Schema>,
	bypassCache = false
): Promise<HydratedProfile> => {
	const store = get(puzzleStore);
	const currentUser = await getCurrentUser();
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
			puzzleStore.set({
				...store,
				profile: { [getProfileResponse.data.id]: getProfileResponse.data as HydratedProfile }
			});
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

	const profile = hydratedProfile.data as HydratedProfile;
	puzzleStore.set({
		...store,
		profile: {
			[profile.id]: profile
		}
	});

	return profile;
};
