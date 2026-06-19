import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	isDevServer,
	shouldHandleFetch,
	deleteOldCaches,
	fetchAndCache
} from './service-worker-helpers';

describe('isDevServer', () => {
	it('returns true when hostname matches but port differs', () => {
		expect(isDevServer('localhost', '5173', 'localhost', '3000')).toBe(true);
	});

	it('returns false when hostname and port both match', () => {
		expect(isDevServer('localhost', '3000', 'localhost', '3000')).toBe(false);
	});

	it('returns false when hostname differs', () => {
		expect(isDevServer('other.host', '5173', 'localhost', '3000')).toBe(false);
	});
});

describe('shouldHandleFetch', () => {
	it('returns false for non-GET methods', () => {
		expect(
			shouldHandleFetch(
				'POST',
				false,
				'https:',
				'example.com',
				'443',
				'example.com',
				'443',
				'default',
				false
			)
		).toBe(false);
	});

	it('returns false when request has range header', () => {
		expect(
			shouldHandleFetch(
				'GET',
				true,
				'https:',
				'example.com',
				'443',
				'example.com',
				'443',
				'default',
				false
			)
		).toBe(false);
	});

	it('returns false for non-http protocols', () => {
		expect(
			shouldHandleFetch(
				'GET',
				false,
				'data:',
				'example.com',
				'443',
				'example.com',
				'443',
				'default',
				false
			)
		).toBe(false);
	});

	it('returns false for dev server requests', () => {
		expect(
			shouldHandleFetch(
				'GET',
				false,
				'http:',
				'localhost',
				'5173',
				'localhost',
				'3000',
				'default',
				false
			)
		).toBe(false);
	});

	it('returns false when cache is only-if-cached and not a static asset', () => {
		expect(
			shouldHandleFetch(
				'GET',
				false,
				'https:',
				'example.com',
				'443',
				'example.com',
				'443',
				'only-if-cached',
				false
			)
		).toBe(false);
	});

	it('returns true when cache is only-if-cached but is a static asset', () => {
		expect(
			shouldHandleFetch(
				'GET',
				false,
				'https:',
				'example.com',
				'443',
				'example.com',
				'443',
				'only-if-cached',
				true
			)
		).toBe(true);
	});

	it('returns true for a valid GET http request', () => {
		expect(
			shouldHandleFetch(
				'GET',
				false,
				'https:',
				'example.com',
				'443',
				'example.com',
				'443',
				'default',
				false
			)
		).toBe(true);
	});
});

describe('deleteOldCaches', () => {
	beforeEach(() => {
		vi.stubGlobal('caches', {
			delete: vi.fn().mockResolvedValue(true)
		});
	});

	it('deletes caches that do not match current cache name', async () => {
		await deleteOldCaches(['cache1', 'cache2', 'current'], 'current');

		expect(caches.delete).toHaveBeenCalledWith('cache1');
		expect(caches.delete).toHaveBeenCalledWith('cache2');
		expect(caches.delete).toHaveBeenCalledTimes(2);
	});

	it('does nothing when all keys match current cache name', async () => {
		await deleteOldCaches(['current'], 'current');

		expect(caches.delete).not.toHaveBeenCalled();
	});

	it('does nothing with an empty keys array', async () => {
		await deleteOldCaches([], 'current');

		expect(caches.delete).not.toHaveBeenCalled();
	});
});

describe('fetchAndCache', () => {
	const mockPut = vi.fn().mockResolvedValue(undefined);
	const mockMatch = vi.fn();

	beforeEach(() => {
		vi.stubGlobal('caches', {
			open: vi.fn().mockResolvedValue({
				put: mockPut,
				match: mockMatch
			})
		});
		mockPut.mockClear();
		mockMatch.mockClear();
	});

	it('fetches from network and caches the response', async () => {
		const mockResponse = new Response('body', { status: 200 });
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

		const request = new Request('https://example.com/file.js');
		const result = await fetchAndCache(request, 'offline123');

		expect(caches.open).toHaveBeenCalledWith('offline123');
		expect(fetch).toHaveBeenCalledWith(request);
		expect(mockPut).toHaveBeenCalled();
		expect(result).toBe(mockResponse);
	});

	it('falls back to cache when fetch fails and cached response exists', async () => {
		const cachedResponse = new Response('cached', { status: 200 });
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
		mockMatch.mockResolvedValue(cachedResponse);

		const request = new Request('https://example.com/file.js');
		const result = await fetchAndCache(request, 'offline123');

		expect(result).toBe(cachedResponse);
	});

	it('throws when fetch fails and no cached response exists', async () => {
		const error = new Error('offline');
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
		mockMatch.mockResolvedValue(undefined);

		const request = new Request('https://example.com/file.js');

		await expect(fetchAndCache(request, 'offline123')).rejects.toThrow('offline');
	});
});
