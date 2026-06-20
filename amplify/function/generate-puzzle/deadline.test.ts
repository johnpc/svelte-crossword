import { describe, it, expect } from 'vitest';
import { DeadlineError, checkDeadline } from './deadline';

describe('deadline', () => {
	it('throws DeadlineError when the deadline is in the past', () => {
		expect(() => checkDeadline(Date.now() - 100)).toThrow(DeadlineError);
	});

	it('does not throw when the deadline is in the future', () => {
		expect(() => checkDeadline(Date.now() + 60_000)).not.toThrow();
	});

	it('DeadlineError carries the expected name', () => {
		try {
			checkDeadline(0);
		} catch (e) {
			expect(e).toBeInstanceOf(DeadlineError);
			expect((e as Error).name).toBe('DeadlineError');
		}
	});
});
