import { describe, it, expect, vi } from 'vitest';
import { failed, loading, ready, settle } from './remoteData';

describe('remoteData', () => {
	it('builds the three shapes', () => {
		expect(loading()).toEqual({ status: 'loading' });
		expect(ready([1])).toEqual({ status: 'ready', data: [1] });
		expect(failed('nope')).toEqual({ status: 'failed', message: 'nope' });
	});

	it('settle resolves a loader into ready', async () => {
		await expect(settle(async () => 'x', 'msg')).resolves.toEqual(ready('x'));
	});

	it('settle keeps a null result as "not settled" (redirects are handled by the loader)', async () => {
		await expect(settle(async () => null, 'msg')).resolves.toBeNull();
	});

	it('settle turns a throw into failed with the given message and logs it', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		await expect(
			settle(async () => {
				throw new Error('boom');
			}, 'Could not load')
		).resolves.toEqual(failed('Could not load'));
		expect(spy).toHaveBeenCalledWith('Could not load', expect.any(Error));
		spy.mockRestore();
	});
});
