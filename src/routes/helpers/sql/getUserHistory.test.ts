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

import { getUserHistory } from './getUserHistory';

describe('getUserHistory', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps database rows to UserHistoryEntry format', async () => {
		const rows = [
			{
				id: '1',
				profile_id: 'p1',
				puzzle_id: 'pz1',
				used_check: 1,
				used_reveal: 0,
				used_clear: 0,
				time_in_seconds: 120,
				created_at: '2024-01-01T00:00:00Z',
				title: 'Test Puzzle',
				author: 'Author'
			}
		];

		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(rows) }))
		});

		const result = await getUserHistory('profile-123');
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			id: '1',
			profileId: 'p1',
			puzzleId: 'pz1',
			usedCheck: true,
			usedReveal: false,
			usedClear: false,
			timeInSeconds: 120,
			createdAt: '2024-01-01T00:00:00Z',
			puzzleTitle: 'Test Puzzle',
			puzzleAuthor: 'Author'
		});
	});

	it('returns empty array when no history exists', async () => {
		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify([]) }))
		});

		const result = await getUserHistory('profile-123');
		expect(result).toEqual([]);
	});

	it('handles missing optional fields', async () => {
		const rows = [
			{
				id: '1',
				profile_id: 'p1',
				puzzle_id: 'pz1',
				used_check: 0,
				used_reveal: 0,
				used_clear: 0,
				time_in_seconds: 60,
				created_at: '2024-01-01T00:00:00Z'
			}
		];

		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(rows) }))
		});

		const result = await getUserHistory('profile-123');
		expect(result[0].puzzleTitle).toBeUndefined();
		expect(result[0].puzzleAuthor).toBeUndefined();
	});

	it('throws when function name is missing from config', async () => {
		const mod = await import('../../../amplify_outputs.json');
		const originalCustom = mod.default.custom;
		(mod.default as { custom: unknown }).custom = {};

		await expect(getUserHistory('profile-123')).rejects.toThrow(
			'SQL queries function name not found in config'
		);

		(mod.default as { custom: unknown }).custom = originalCustom;
	});
});
