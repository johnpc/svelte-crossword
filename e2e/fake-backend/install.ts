/**
 * Wires the fake backend into a Playwright BrowserContext: every request the
 * app would send to Cognito or Lambda is answered in-process, with CORS
 * headers, so a run depends on nothing outside the test runner.
 */
import { readFileSync } from 'fs';
import type { BrowserContext, Route } from '@playwright/test';
import { FakeCognito } from './fakeCognito';
import { createFakeDb, runFakeQuery, type FakeDb } from './fakeSql';
import { signedInStorage, type AuthConfig, type FakeUser } from './tokens';

export const AWS_HOSTS =
	/^https:\/\/(cognito-idp|cognito-identity|lambda)\.[a-z0-9-]+\.amazonaws\.com\//;

const CORS = {
	'access-control-allow-origin': '*',
	'access-control-allow-headers': '*',
	'access-control-allow-methods': 'GET,POST,OPTIONS',
	'access-control-expose-headers': '*'
};

/** The user every signed-in scenario plays as. Seeded with a profile in the fake DB. */
export const ADA: FakeUser = {
	sub: '11111111-1111-4111-8111-111111111111',
	email: 'ada@example.com',
	password: 'Password1!'
};

type AmplifyOutputs = {
	auth: {
		user_pool_id: string;
		user_pool_client_id: string;
		identity_pool_id: string;
		aws_region: string;
	};
};

/** Reads the pool/client ids from whichever amplify_outputs.json the build embeds. */
export const authConfigFrom = (config: AmplifyOutputs): AuthConfig => ({
	userPoolId: config.auth.user_pool_id,
	clientId: config.auth.user_pool_client_id,
	identityPoolId: config.auth.identity_pool_id,
	region: config.auth.aws_region
});

/** The build's config when present (real or fixture), else the e2e fixture itself. */
const embeddedOutputs = (): AmplifyOutputs => {
	for (const path of ['src/amplify_outputs.json', 'e2e/fixtures/amplify_outputs.e2e.json']) {
		try {
			return JSON.parse(readFileSync(path, 'utf-8'));
		} catch {
			// fall through to the fixture
		}
	}
	throw new Error('No amplify_outputs.json found for the fake backend');
};

export type FakeBackend = {
	db: FakeDb;
	cognito: FakeCognito;
	config: AuthConfig;
	/** Start the next page load already signed in as `user`. */
	signInAs(user: FakeUser): Promise<void>;
};

export async function installFakeBackend(
	context: BrowserContext,
	config: AuthConfig = authConfigFrom(embeddedOutputs()),
	users: FakeUser[] = [ADA]
): Promise<FakeBackend> {
	const db = createFakeDb({
		profiles: users.map((u) => ({ id: u.sub, user_id: u.sub, name: u.email, email: u.email }))
	});
	const cognito = new FakeCognito(users, config);

	await context.route(AWS_HOSTS, async (route: Route) => {
		const request = route.request();
		if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
		const host = new URL(request.url()).hostname;
		const body = JSON.parse(request.postData() || '{}');
		if (host.startsWith('lambda.')) {
			return route.fulfill({
				status: 200,
				headers: { ...CORS, 'content-type': 'application/json' },
				body: JSON.stringify(invokeLambda(db, body))
			});
		}
		const target = request.headers()['x-amz-target'] ?? '';
		const result = host.startsWith('cognito-idp.')
			? cognito.userPool(target, body)
			: cognito.identityPool(target);
		return route.fulfill({
			status: result.status,
			headers: { ...CORS, 'content-type': 'application/x-amz-json-1.1' },
			body: JSON.stringify(result.body)
		});
	});

	return {
		db,
		cognito,
		config,
		signInAs: (user) =>
			context.addInitScript(
				(entries: Record<string, string>) => {
					for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
				},
				signedInStorage(user, config)
			)
	};
}

/** A thrown handler becomes the Lambda runtime's `{ errorMessage }` envelope, as in production. */
function invokeLambda(db: FakeDb, payload: Record<string, unknown>) {
	try {
		return runFakeQuery(db, payload);
	} catch (e) {
		return { errorType: 'Error', errorMessage: (e as Error).message };
	}
}
