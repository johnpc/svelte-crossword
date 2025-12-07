import type { Schema } from '../../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';

const client = generateClient<Schema>({ authMode: 'userPool' });

export const getOrCreateProfile = async () => {
	const currentUser = await getCurrentUser();
	const userAttributes = await fetchUserAttributes();

	const existing = await client.models.SqlProfile.get({ id: currentUser.userId });
	if (existing.data) return existing.data;

	const email = currentUser.signInDetails?.loginId || userAttributes.email || currentUser.username;
	const name =
		currentUser.signInDetails?.loginId ||
		userAttributes.name ||
		userAttributes.email ||
		currentUser.username;

	const created = await client.models.SqlProfile.create({
		id: currentUser.userId,
		user_id: currentUser.userId,
		email,
		name
	});

	return created.data!;
};
