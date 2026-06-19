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

import { getNextPuzzle } from './getNextPuzzle';

describe('getNextPuzzle', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns formatted puzzle data', async () => {
		const puzJson = {
			header: { title: 'Daily Puzzle', author: 'Test Author' },
			clues: {
				across: [{ answer: 'CAT', clue: 'Feline', x: 0, y: 0, direction: 'across' }],
				down: [{ answer: 'COP', clue: 'Officer', x: 0, y: 0, direction: 'down' }]
			}
		};

		const puzzleData = { id: 'puzzle-1', puzJson: JSON.stringify(puzJson) };

		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(puzzleData) }))
		});

		const result = await getNextPuzzle('profile-123');
		expect(result.id).toBe('puzzle-1');
		expect(result.title).toBe('Daily Puzzle');
		expect(result.author).toBe('Test Author');
		expect(result.clues).toHaveLength(2);
	});

	it('handles pre-parsed puzJson', async () => {
		const puzJson = {
			header: { title: 'Test', author: 'Author' },
			clues: {
				across: [{ answer: 'AB', clue: 'Test', x: 0, y: 0, direction: 'across' }],
				down: []
			}
		};

		const puzzleData = { id: 'puzzle-2', puzJson };

		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(puzzleData) }))
		});

		const result = await getNextPuzzle('profile-123');
		expect(result.id).toBe('puzzle-2');
		expect(result.clues).toHaveLength(1);
	});

	it('throws when function name is missing', async () => {
		const mod = await import('../../../amplify_outputs.json');
		const originalCustom = mod.default.custom;
		(mod.default as { custom: unknown }).custom = {};

		await expect(getNextPuzzle('profile-123')).rejects.toThrow(
			'SQL queries function name not found in config'
		);

		(mod.default as { custom: unknown }).custom = originalCustom;
	});
});
