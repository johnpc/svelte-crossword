import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import type { HydratedProfile } from '../types/types';
import { invokeSqlQuery } from './invokeSqlQuery';

export const getOrCreateProfile = async (): Promise<HydratedProfile> => {
	const currentUser = await getCurrentUser();
	const userAttributes = await fetchUserAttributes();

	const existing = await invokeSqlQuery<HydratedProfile | null>({
		query: 'getProfile',
		userId: currentUser.userId
	});
	if (existing) return existing;

	const email = currentUser.signInDetails?.loginId || userAttributes.email || currentUser.username;
	const name =
		currentUser.signInDetails?.loginId ||
		userAttributes.name ||
		userAttributes.email ||
		currentUser.username;

	return invokeSqlQuery<HydratedProfile>({
		query: 'createProfile',
		userId: currentUser.userId,
		email,
		name
	});
};
