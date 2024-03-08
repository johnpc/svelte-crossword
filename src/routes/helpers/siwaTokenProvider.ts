import { Amplify } from 'aws-amplify';
import { type TokenProvider, decodeJWT } from 'aws-amplify/auth';

// ...

export const siwaTokenProvider: TokenProvider = {
	async getTokens({ forceRefresh } = {}) {
		if (forceRefresh) {
			// try to obtain new tokens if possible
		}

		const accessTokenString = '<insert JWT from provider>';
		const idTokenString = '<insert JWT from provider>';

		return {
			accessToken: decodeJWT(accessTokenString),
			idToken: decodeJWT(idTokenString)
		};
	}
};

Amplify.configure(awsconfig, {
	Auth: {
		tokenProvider: siwaTokenProvider
	}
});
