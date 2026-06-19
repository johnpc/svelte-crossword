import { describe, it, expect } from 'vitest';
import { getHumanReadableDuration } from './getHumanReadableDuration';

describe('getHumanReadableDuration', () => {
	it('returns seconds only for durations under a minute', () => {
		expect(getHumanReadableDuration(45)).toBe('   45s');
	});

	it('returns minutes and seconds', () => {
		expect(getHumanReadableDuration(125)).toBe('  2m 5s');
	});

	it('returns hours, minutes, and seconds', () => {
		expect(getHumanReadableDuration(3661)).toBe(' 1h 1m 1s');
	});

	it('returns days, hours, minutes, and seconds', () => {
		expect(getHumanReadableDuration(90061)).toBe('1d 1h 1m 1s');
	});

	it('handles zero seconds', () => {
		expect(getHumanReadableDuration(0)).toBe('   ');
	});

	it('handles exact minutes', () => {
		expect(getHumanReadableDuration(120)).toBe('  2m ');
	});

	it('handles exact hours', () => {
		expect(getHumanReadableDuration(3600)).toBe(' 1h  ');
	});

	it('handles exact days', () => {
		expect(getHumanReadableDuration(86400)).toBe('1d   ');
	});
});
