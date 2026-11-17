/**
 * Unsigned JWTs shaped like Cognito's. Amplify only decodes the payload in the
 * browser (signature verification is the backend's job), so these satisfy
 * getCurrentUser()/fetchAuthSession() without any key material.
 */
export type FakeUser = { sub: string; email: string; password: string };

export type AuthConfig = {
	userPoolId: string;
	clientId: string;
	identityPoolId: string;
	region: string;
};

const b64url = (value: string) =>
	Buffer.from(value).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

export const fakeJwt = (payload: Record<string, unknown>) =>
	`${b64url(JSON.stringify({ alg: 'RS256', kid: 'fake', typ: 'JWT' }))}.${b64url(
		JSON.stringify(payload)
	)}.${b64url('fake-signature')}`;

export type IssuedTokens = { idToken: string; accessToken: string; refreshToken: string };

/** One hour of validity measured from `nowMs`, which is what Cognito issues too. */
export function issueTokens(user: FakeUser, config: AuthConfig, nowMs = Date.now()): IssuedTokens {
	const iat = Math.floor(nowMs / 1000);
	const exp = iat + 3600;
	const iss = `https://cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}`;
	const common = { sub: user.sub, iss, iat, exp, auth_time: iat, origin_jti: 'fake-origin' };
	return {
		idToken: fakeJwt({
			...common,
			aud: config.clientId,
			token_use: 'id',
			'cognito:username': user.sub,
			email: user.email,
			email_verified: true,
			jti: 'fake-id-jti'
		}),
		accessToken: fakeJwt({
			...common,
			client_id: config.clientId,
			token_use: 'access',
			username: user.sub,
			scope: 'aws.cognito.signin.user.admin',
			jti: 'fake-access-jti'
		}),
		refreshToken: 'fake-refresh-token'
	};
}

/**
 * The localStorage entries Amplify's DefaultTokenStore reads on page load, so a
 * scenario can start signed in without driving the login form.
 */
export function signedInStorage(user: FakeUser, config: AuthConfig): Record<string, string> {
	const tokens = issueTokens(user, config);
	const prefix = `CognitoIdentityServiceProvider.${config.clientId}`;
	const userPrefix = `${prefix}.${user.sub}`;
	return {
		[`${prefix}.LastAuthUser`]: user.sub,
		[`${userPrefix}.idToken`]: tokens.idToken,
		[`${userPrefix}.accessToken`]: tokens.accessToken,
		[`${userPrefix}.refreshToken`]: tokens.refreshToken,
		[`${userPrefix}.clockDrift`]: '0',
		[`${userPrefix}.signInDetails`]: JSON.stringify({
			loginId: user.email,
			authFlowType: 'USER_SRP_AUTH'
		})
	};
}
