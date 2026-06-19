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

import { getStreakInfo } from './getStreakInfo';

describe('getStreakInfo', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns streak info with activity data', async () => {
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		const rows = [{ created_at: today.toISOString() }, { created_at: yesterday.toISOString() }];

		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(rows) }))
		});

		const result = await getStreakInfo('profile-123');
		expect(result).toHaveProperty('longestStreak');
		expect(result).toHaveProperty('currentStreak');
		expect(result).toHaveProperty('allActivity');
		expect(result.currentStreak).toBeGreaterThanOrEqual(1);
	});

	it('returns zero current streak for no activity', async () => {
		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify([]) }))
		});

		const result = await getStreakInfo('profile-123');
		expect(result.currentStreak).toBe(0);
		expect(result.allActivity).toHaveLength(0);
	});

	it('calculates longest streak correctly', async () => {
		const day1 = new Date('2024-01-01');
		const day2 = new Date('2024-01-02');
		const day3 = new Date('2024-01-03');
		const day5 = new Date('2024-01-05');

		const rows = [
			{ created_at: day1.toISOString() },
			{ created_at: day2.toISOString() },
			{ created_at: day3.toISOString() },
			{ created_at: day5.toISOString() }
		];

		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(rows) }))
		});

		const result = await getStreakInfo('profile-123');
		expect(result.longestStreak).toBe(3);
	});

	it('throws when function name is missing from config', async () => {
		const mod = await import('../../../amplify_outputs.json');
		const originalCustom = mod.default.custom;
		(mod.default as { custom: unknown }).custom = {};

		await expect(getStreakInfo('profile-123')).rejects.toThrow(
			'SQL queries function name not found in config'
		);

		(mod.default as { custom: unknown }).custom = originalCustom;
	});
});
