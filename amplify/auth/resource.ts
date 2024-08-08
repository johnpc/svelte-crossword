// import { defineAuth } from '@aws-amplify/backend';
import { defineAuth, secret } from '@aws-amplify/backend';
import { ProviderAttribute } from 'aws-cdk-lib/aws-cognito';

export const auth = defineAuth({
	loginWith: {
		email: true,
		externalProviders: {
			domainPrefix: 'smallcrosswordslogin',
			google: {
				clientId: secret('GOOGLE_CLIENT_ID'),
				clientSecret: secret('GOOGLE_CLIENT_SECRET'),
				attributeMapping: {
					email: ProviderAttribute.GOOGLE_EMAIL
				},
				scopes: ['profile', 'email']
			},
			signInWithApple: {
				clientId: secret('SIWA_CLIENT_ID'),
				keyId: secret('SIWA_KEY_ID'),
				privateKey: secret('SIWA_PRIVATE_KEY'),
				teamId: secret('SIWA_TEAM_ID'),
				attributeMapping: {
					email: ProviderAttribute.APPLE_EMAIL
				},
				scopes: ['name', 'email']
			},
			callbackUrls: [
				'http://localhost:5173/',
				'https://smallcrosswords.com/',
				'https://www.smallcrosswords.com/',
				'https://smallcrosswordslogin.auth.us-west-2.amazoncognito.com',
				'https://smallcrosswordslogin.auth.us-west-2.amazoncognito.com/oauth2/idpresponse'
			],
			logoutUrls: [
				'http://localhost:5173/',
				'https://smallcrosswords.com/',
				'https://www.smallcrosswords.com/'
			]
		}
	}
});
