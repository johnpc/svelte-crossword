/**
 * Fake Cognito User Pool + Identity Pool. Handles exactly the X-Amz-Target
 * actions the app's Amplify calls produce. The SRP exchange is "accepted":
 * Cognito never sees the password in USER_SRP_AUTH, so the fake only checks
 * that the user exists; unknown users get Cognito's real UserNotFoundException.
 */
import { issueTokens, type AuthConfig, type FakeUser } from './tokens';

export type CognitoResult = { status: number; body: Record<string, unknown> };

const ok = (body: Record<string, unknown> = {}): CognitoResult => ({ status: 200, body });
const CODE_SENT = { Destination: 'e***', DeliveryMedium: 'EMAIL', AttributeName: 'email' };
const fail = (type: string, message: string): CognitoResult => ({
	status: 400,
	body: { __type: type, message }
});

export class FakeCognito {
	constructor(
		private readonly users: FakeUser[],
		private readonly config: AuthConfig
	) {}

	private find(username: string | undefined) {
		return this.users.find((u) => u.email === username || u.sub === username);
	}

	private authenticated(user: FakeUser) {
		const tokens = issueTokens(user, this.config);
		return ok({
			AuthenticationResult: {
				IdToken: tokens.idToken,
				AccessToken: tokens.accessToken,
				RefreshToken: tokens.refreshToken,
				ExpiresIn: 3600,
				TokenType: 'Bearer'
			},
			ChallengeParameters: {}
		});
	}

	private initiateAuth(body: Record<string, unknown>): CognitoResult {
		const params = (body.AuthParameters ?? {}) as Record<string, string>;
		const user = this.find(params.USERNAME);
		if (!user) return fail('UserNotFoundException', 'User does not exist.');
		if (body.AuthFlow === 'USER_PASSWORD_AUTH') {
			return user.password === params.PASSWORD
				? this.authenticated(user)
				: fail('NotAuthorizedException', 'Incorrect username or password.');
		}
		return ok({
			ChallengeName: 'PASSWORD_VERIFIER',
			Session: 'fake-session',
			ChallengeParameters: {
				USER_ID_FOR_SRP: user.sub,
				USERNAME: user.sub,
				SRP_B: 'ab'.repeat(128),
				SALT: 'cd'.repeat(16),
				SECRET_BLOCK: Buffer.from('fake-secret-block').toString('base64')
			}
		});
	}

	private respondToAuthChallenge(body: Record<string, unknown>): CognitoResult {
		const params = (body.ChallengeResponses ?? {}) as Record<string, string>;
		const user = this.find(params.USERNAME);
		return user ? this.authenticated(user) : fail('NotAuthorizedException', 'Unknown user');
	}

	private getUser(): CognitoResult {
		const user = this.users[0];
		return ok({
			Username: user.sub,
			UserAttributes: [
				{ Name: 'sub', Value: user.sub },
				{ Name: 'email', Value: user.email },
				{ Name: 'email_verified', Value: 'true' }
			]
		});
	}

	private readonly actions: Record<string, (body: Record<string, unknown>) => CognitoResult> = {
		InitiateAuth: (body) => this.initiateAuth(body),
		RespondToAuthChallenge: (body) => this.respondToAuthChallenge(body),
		GetUser: () => this.getUser(),
		SignUp: () =>
			ok({ UserConfirmed: false, UserSub: 'fake-new-sub', CodeDeliveryDetails: CODE_SENT }),
		ForgotPassword: () => ok({ CodeDeliveryDetails: CODE_SENT }),
		ConfirmSignUp: () => ok(),
		ConfirmForgotPassword: () => ok(),
		RevokeToken: () => ok(),
		GlobalSignOut: () => ok(),
		DeleteUser: () => ok()
	};

	/** cognito-idp.<region>.amazonaws.com */
	userPool(target: string, body: Record<string, unknown>): CognitoResult {
		const action = target.split('.').pop() ?? '';
		const handler = this.actions[action];
		return handler
			? handler(body)
			: fail('UnknownOperationException', `Fake Cognito does not implement ${action}`);
	}

	/** cognito-identity.<region>.amazonaws.com */
	identityPool(target: string): CognitoResult {
		const action = target.split('.').pop();
		const IdentityId = `${this.config.region}:fake-identity-id`;
		if (action === 'GetId') return ok({ IdentityId });
		if (action === 'GetCredentialsForIdentity') {
			return ok({
				IdentityId,
				Credentials: {
					AccessKeyId: 'FAKEACCESSKEYID00000',
					SecretKey: 'fake-secret-key',
					SessionToken: 'fake-session-token',
					Expiration: Math.floor(Date.now() / 1000) + 3600
				}
			});
		}
		return fail('UnknownOperationException', `Fake Cognito Identity does not implement ${action}`);
	}
}
