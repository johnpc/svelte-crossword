import { describe, it, expect } from 'vitest';
import { GET } from './+server';

describe('GET /api/ping', () => {
	it('returns a random number between min and max', async () => {
		const url = new URL('http://localhost/api/ping?min=0&max=10');
		const response = GET({ url } as Parameters<typeof GET>[0]);
		const text = await response.text();
		const num = Number(text);
		expect(num).toBeGreaterThanOrEqual(0);
		expect(num).toBeLessThanOrEqual(10);
	});

	it('uses defaults of 0 and 1 when no params provided', async () => {
		const url = new URL('http://localhost/api/ping');
		const response = GET({ url } as Parameters<typeof GET>[0]);
		const text = await response.text();
		const num = Number(text);
		expect(num).toBeGreaterThanOrEqual(0);
		expect(num).toBeLessThanOrEqual(1);
	});

	it('throws 400 when min is greater than max', async () => {
		const url = new URL('http://localhost/api/ping?min=10&max=5');
		expect(() => GET({ url } as Parameters<typeof GET>[0])).toThrow();
	});

	it('throws 400 for non-numeric parameters', async () => {
		const url = new URL('http://localhost/api/ping?min=abc&max=xyz');
		expect(() => GET({ url } as Parameters<typeof GET>[0])).toThrow();
	});
});
