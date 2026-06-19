import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSend = vi.fn();

vi.mock('aws-amplify/auth', () => ({
	fetchAuthSession: vi.fn().mockResolvedValue({
		credentials: { accessKeyId: 'test', secretAccessKey: 'test', sessionToken: 'test' }
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

import { getLeaderboard } from './getLeaderboard';

describe('getLeaderboard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	it('returns leaderboard data', async () => {
		const body = {
			users: [{ id: '1', name: 'Test', email: 'test@test.com', completedCount: 5 }],
			total: 1
		};

		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(body) }))
		});

		const result = await getLeaderboard();
		expect(result.users).toHaveLength(1);
		expect(result.total).toBe(1);
		expect(result.users[0].completedCount).toBe(5);
	});

	it('throws on empty lambda response', async () => {
		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode('undefined')
		});

		await expect(getLeaderboard()).rejects.toThrow('Lambda returned empty response');
	});

	it('throws on lambda error', async () => {
		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ errorMessage: 'Something went wrong' }))
		});

		await expect(getLeaderboard()).rejects.toThrow('Lambda error: Something went wrong');
	});

	it('throws when function name is missing from config', async () => {
		const mod = await import('../../../amplify_outputs.json');
		const originalCustom = mod.default.custom;
		(mod.default as { custom: unknown }).custom = {};

		await expect(getLeaderboard()).rejects.toThrow('SQL queries function name not found in config');

		(mod.default as { custom: unknown }).custom = originalCustom;
	});
});
