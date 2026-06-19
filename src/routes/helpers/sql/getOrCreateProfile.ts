import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import { invokeSqlQuery } from './invokeSqlQuery';

export const getOrCreateProfile = async () => {
	const currentUser = await getCurrentUser();
	const userAttributes = await fetchUserAttributes();

	const existing = await invokeSqlQuery({ query: 'getProfile', userId: currentUser.userId });
	if (existing) return existing;

	const email = currentUser.signInDetails?.loginId || userAttributes.email || currentUser.username;
	const name =
		currentUser.signInDetails?.loginId ||
		userAttributes.name ||
		userAttributes.email ||
		currentUser.username;

	return invokeSqlQuery({ query: 'createProfile', userId: currentUser.userId, email, name });
};
