import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSend = vi.fn();

vi.mock('aws-amplify/auth', () => ({
	fetchAuthSession: vi.fn().mockResolvedValue({
		credentials: { accessKeyId: 'test', secretAccessKey: 'test', sessionToken: 'test' }
	}),
	fetchUserAttributes: vi.fn().mockResolvedValue({
		email: 'user@test.com',
		name: 'Test User'
	}),
	getCurrentUser: vi.fn().mockResolvedValue({
		userId: 'user-123',
		username: 'testuser',
		signInDetails: { loginId: 'user@test.com' }
	})
}));

vi.mock('aws-amplify', () => ({
	Amplify: { configure: vi.fn() }
}));

vi.mock('../../../amplify_outputs.json', () => ({
	default: { custom: { sqlQueriesFunctionName: 'test-function' } }
}));

vi.mock('@aws-sdk/client-lambda', () => {
	return {
		LambdaClient: class {
			send = mockSend;
		},
		InvokeCommand: class {
			constructor(public input: unknown) {}
		}
	};
});

import { getOrCreateProfile } from './getOrCreateProfile';

describe('getOrCreateProfile', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns existing profile if found', async () => {
		const existingProfile = { id: 'profile-1', email: 'user@test.com', name: 'Test User' };

		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(existingProfile) }))
		});

		const result = await getOrCreateProfile();
		expect(result).toEqual(existingProfile);
		expect(mockSend).toHaveBeenCalledTimes(1);
	});

	it('creates new profile when none exists', async () => {
		const newProfile = { id: 'profile-new', email: 'user@test.com', name: 'user@test.com' };

		mockSend
			.mockResolvedValueOnce({
				Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(null) }))
			})
			.mockResolvedValueOnce({
				Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(newProfile) }))
			});

		const result = await getOrCreateProfile();
		expect(result).toEqual(newProfile);
		expect(mockSend).toHaveBeenCalledTimes(2);
	});

	it('throws when function name is missing', async () => {
		const mod = await import('../../../amplify_outputs.json');
		const originalCustom = mod.default.custom;
		(mod.default as { custom: unknown }).custom = {};

		await expect(getOrCreateProfile()).rejects.toThrow(
			'SQL queries function name not found in config'
		);

		(mod.default as { custom: unknown }).custom = originalCustom;
	});
});
