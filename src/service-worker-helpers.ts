/**
 * Pure helper functions extracted from service-worker.ts for testability.
 */

/**
 * Determines if a request is targeting the dev server.
 */
export function isDevServer(
	hostname: string,
	port: string,
	selfHostname: string,
	selfPort: string
): boolean {
	return hostname === selfHostname && port !== selfPort;
}

/**
 * Determines whether a fetch event should be handled by the service worker.
 */
export function shouldHandleFetch(
	method: string,
	hasRange: boolean,
	protocol: string,
	hostname: string,
	port: string,
	selfHostname: string,
	selfPort: string,
	cache: string,
	isStaticAsset: boolean
): boolean {
	if (method !== 'GET' || hasRange) return false;

	const isHttp = protocol.startsWith('http');
	const isDevServerRequest = isDevServer(hostname, port, selfHostname, selfPort);
	const skipBecauseUncached = cache === 'only-if-cached' && !isStaticAsset;

	return isHttp && !isDevServerRequest && !skipBecauseUncached;
}

/**
 * Deletes all caches whose keys do not match the current cache name.
 */
export async function deleteOldCaches(keys: string[], currentCacheName: string): Promise<void> {
	for (const key of keys) {
		if (key !== currentCacheName) {
			await caches.delete(key);
		}
	}
}

/**
 * Fetch the asset from the network and store it in the cache.
 * Fall back to the cache if the user is offline.
 */
export async function fetchAndCache(request: Request, cacheName: string): Promise<Response> {
	const cache = await caches.open(cacheName);

	try {
		const response = await fetch(request);
		cache.put(request, response.clone());
		return response;
	} catch (err) {
		const response = await cache.match(request);
		if (response) return response;

		throw err;
	}
}
