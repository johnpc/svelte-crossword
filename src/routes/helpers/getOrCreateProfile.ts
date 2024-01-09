import type { Schema } from '../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import config from '../../amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';

Amplify.configure(config);
const client = generateClient<Schema>({
	authMode: 'userPool'
});
export const getOrCreateProfile = async () => {
	const currentUser = await getCurrentUser();
	try {
		const getProfileResponse = await client.models.Profile.get({
			id: currentUser.userId
		});
		console.log({ getProfileResponse });
		if (getProfileResponse?.data?.id) {
			return getProfileResponse.data;
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
	return createProfileResponse.data;
};
