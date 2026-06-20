import { describe, it, expect, vi } from 'vitest';
import { createSqlInvoker } from './sql-invoker';
import type { LambdaClient } from '@aws-sdk/client-lambda';

function fakeLambda(payloadString: string): LambdaClient {
	return {
		send: vi.fn().mockResolvedValue({
			Payload: new TextEncoder().encode(payloadString)
		})
	} as unknown as LambdaClient;
}

describe('createSqlInvoker', () => {
	it('returns the parsed body field on success', async () => {
		const invoker = createSqlInvoker(fakeLambda('{"body":"data"}'), 'fn');
		expect(await invoker({ q: 'getPuzzle' })).toBe('data');
	});

	it('returns the literal "null" when body is missing', async () => {
		const invoker = createSqlInvoker(fakeLambda('{}'), 'fn');
		expect(await invoker({})).toBe('null');
	});

	it('serializes the payload as JSON', async () => {
		const sendMock = vi.fn().mockResolvedValue({
			Payload: new TextEncoder().encode('{"body":"x"}')
		});
		const client = { send: sendMock } as unknown as LambdaClient;
		const invoker = createSqlInvoker(client, 'fn-name');
		await invoker({ a: 1 });
		const cmd = sendMock.mock.calls[0][0];
		expect(cmd.input.FunctionName).toBe('fn-name');
		expect(cmd.input.Payload).toBe('{"a":1}');
	});
});
