import { describe, it, expect } from 'vitest';
import { FakeCognito } from './fakeCognito';
import { issueTokens, signedInStorage } from './tokens';

const config = {
	userPoolId: 'us-west-2_FAKEPOOL0',
	clientId: 'fakeclientid0000000000000',
	identityPoolId: 'us-west-2:0000',
	region: 'us-west-2'
};
const ada = { sub: 'sub-ada', email: 'ada@example.com', password: 'Password1!' };
const decode = (jwt: string) => JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString());

describe('tokens', () => {
	it('issues id/access tokens Amplify can decode, valid for an hour', () => {
		const t = issueTokens(ada, config, 1_000_000_000_000);
		expect(decode(t.idToken)).toMatchObject({
			sub: 'sub-ada',
			'cognito:username': 'sub-ada',
			email: ada.email,
			aud: config.clientId,
			token_use: 'id',
			iat: 1_000_000_000,
			exp: 1_000_003_600
		});
		expect(decode(t.accessToken)).toMatchObject({ username: 'sub-ada', token_use: 'access' });
	});

	it('signedInStorage writes the DefaultTokenStore keys for the client id', () => {
		const entries = signedInStorage(ada, config);
		const prefix = `CognitoIdentityServiceProvider.${config.clientId}`;
		expect(entries[`${prefix}.LastAuthUser`]).toBe('sub-ada');
		expect(Object.keys(entries)).toEqual(
			expect.arrayContaining(
				['idToken', 'accessToken', 'refreshToken', 'clockDrift', 'signInDetails'].map(
					(k) => `${prefix}.sub-ada.${k}`
				)
			)
		);
		expect(JSON.parse(entries[`${prefix}.sub-ada.signInDetails`])).toEqual({
			loginId: ada.email,
			authFlowType: 'USER_SRP_AUTH'
		});
	});
});

describe('FakeCognito user pool', () => {
	const cognito = new FakeCognito([ada], config);
	const call = (action: string, body: Record<string, unknown> = {}) =>
		cognito.userPool(`AWSCognitoIdentityProviderService.${action}`, body);

	it('SRP sign-in: challenge for a known user, tokens on the response', () => {
		const challenge = call('InitiateAuth', {
			AuthFlow: 'USER_SRP_AUTH',
			AuthParameters: { USERNAME: ada.email }
		});
		expect(challenge.body).toMatchObject({
			ChallengeName: 'PASSWORD_VERIFIER',
			ChallengeParameters: { USER_ID_FOR_SRP: 'sub-ada' }
		});
		const tokens = call('RespondToAuthChallenge', { ChallengeResponses: { USERNAME: 'sub-ada' } });
		expect(tokens.status).toBe(200);
		expect(decode((tokens.body.AuthenticationResult as { IdToken: string }).IdToken).email).toBe(
			ada.email
		);
	});

	it('unknown users and wrong passwords fail like Cognito', () => {
		expect(
			call('InitiateAuth', { AuthFlow: 'USER_SRP_AUTH', AuthParameters: { USERNAME: 'x@y.z' } })
		).toMatchObject({ status: 400, body: { __type: 'UserNotFoundException' } });
		expect(
			call('InitiateAuth', {
				AuthFlow: 'USER_PASSWORD_AUTH',
				AuthParameters: { USERNAME: ada.email, PASSWORD: 'wrong' }
			}).body
		).toMatchObject({ __type: 'NotAuthorizedException' });
		expect(
			call('InitiateAuth', {
				AuthFlow: 'USER_PASSWORD_AUTH',
				AuthParameters: { USERNAME: ada.email, PASSWORD: ada.password }
			}).status
		).toBe(200);
		expect(
			call('RespondToAuthChallenge', { ChallengeResponses: { USERNAME: 'nobody' } }).status
		).toBe(400);
	});

	it('GetUser returns the email attribute; account-lifecycle calls succeed', () => {
		expect(call('GetUser').body).toMatchObject({
			UserAttributes: expect.arrayContaining([{ Name: 'email', Value: ada.email }])
		});
		for (const action of [
			'SignUp',
			'ConfirmSignUp',
			'ForgotPassword',
			'ConfirmForgotPassword',
			'RevokeToken',
			'GlobalSignOut',
			'DeleteUser'
		])
			expect(call(action).status).toBe(200);
		expect(call('Whatever').status).toBe(400);
	});

	it('identity pool hands out an identity and temporary credentials', () => {
		expect(cognito.identityPool('AWSCognitoIdentityService.GetId').body).toEqual({
			IdentityId: 'us-west-2:fake-identity-id'
		});
		const creds = cognito.identityPool('AWSCognitoIdentityService.GetCredentialsForIdentity');
		expect(creds.body).toMatchObject({ Credentials: { AccessKeyId: expect.any(String) } });
		expect(cognito.identityPool('AWSCognitoIdentityService.Nope').status).toBe(400);
	});
});
