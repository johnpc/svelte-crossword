/**
 * The three states every fetched page goes through. A page holds ONE of these
 * instead of an `isLoading` flag next to possibly-stale data, so "spinner or
 * content?" and "did it fail?" are answered by `status` alone.
 */
export type RemoteData<T> =
	| { status: 'loading' }
	| { status: 'ready'; data: T }
	| { status: 'failed'; message: string };

export const loading = <T>(): RemoteData<T> => ({ status: 'loading' });
export const ready = <T>(data: T): RemoteData<T> => ({ status: 'ready', data });
export const failed = <T>(message: string): RemoteData<T> => ({ status: 'failed', message });

/** Resolves a loader into ready/failed; `null` from the loader means "handled elsewhere" (stay loading). */
export const settle = async <T>(
	load: () => Promise<T | null>,
	failureMessage: string
): Promise<RemoteData<T> | null> => {
	try {
		const data = await load();
		return data === null ? null : ready(data);
	} catch (e) {
		console.error(failureMessage, e);
		return failed(failureMessage);
	}
};
