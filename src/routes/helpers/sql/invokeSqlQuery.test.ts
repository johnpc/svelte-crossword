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

vi.mock('@aws-sdk/client-lambda', () => ({
	LambdaClient: class {
		send = mockSend;
	},
	InvokeCommand: class {
		constructor(public input: unknown) {}
	}
}));

import { invokeSqlQuery, getSqlFunctionName } from './invokeSqlQuery';

describe('invokeSqlQuery', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('parses string body responses', async () => {
		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify({ ok: true }) }))
		});
		const result = await invokeSqlQuery({ query: 'x' });
		expect(result).toEqual({ ok: true });
	});

	it('passes through object body responses', async () => {
		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ body: { ok: true } }))
		});
		const result = await invokeSqlQuery({ query: 'x' });
		expect(result).toEqual({ ok: true });
	});

	it('throws when payload is the literal string "undefined"', async () => {
		mockSend.mockResolvedValueOnce({ Payload: new TextEncoder().encode('undefined') });
		await expect(invokeSqlQuery({ query: 'x' })).rejects.toThrow('Lambda returned empty response');
	});

	it('returns undefined when payload is missing', async () => {
		mockSend.mockResolvedValueOnce({});
		const result = await invokeSqlQuery({ query: 'x' });
		expect(result).toBeUndefined();
	});

	it('throws when lambda returns errorMessage', async () => {
		mockSend.mockResolvedValueOnce({
			Payload: new TextEncoder().encode(JSON.stringify({ errorMessage: 'boom' }))
		});
		await expect(invokeSqlQuery({ query: 'x' })).rejects.toThrow('Lambda error: boom');
	});

	describe('getSqlFunctionName', () => {
		it('returns name when configured', () => {
			expect(getSqlFunctionName()).toBe('test-function');
		});

		it('throws when missing', async () => {
			const mod = await import('../../../amplify_outputs.json');
			const original = mod.default.custom;
			(mod.default as { custom: unknown }).custom = {};
			expect(() => getSqlFunctionName()).toThrow('SQL queries function name not found in config');
			(mod.default as { custom: unknown }).custom = original;
		});
	});
});
