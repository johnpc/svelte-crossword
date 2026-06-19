import { describe, it, expect } from 'vitest';
import { getHumanReadableDate } from './getHumanReadableDate';

describe('getHumanReadableDate', () => {
	it('formats a morning date correctly', () => {
		const date = new Date('2024-03-15T09:05:00');
		const result = getHumanReadableDate(date);
		expect(result).toBe('Fri Mar 15 2024 at 9:05am');
	});

	it('formats an afternoon date correctly', () => {
		const date = new Date('2024-03-15T14:30:00');
		const result = getHumanReadableDate(date);
		expect(result).toBe('Fri Mar 15 2024 at 2:30pm');
	});

	it('formats noon correctly', () => {
		const date = new Date('2024-03-15T12:00:00');
		const result = getHumanReadableDate(date);
		expect(result).toBe('Fri Mar 15 2024 at 12:00pm');
	});

	it('pads single-digit minutes with a zero', () => {
		const date = new Date('2024-03-15T15:03:00');
		const result = getHumanReadableDate(date);
		expect(result).toBe('Fri Mar 15 2024 at 3:03pm');
	});

	it('formats midnight correctly', () => {
		const date = new Date('2024-03-15T00:00:00');
		const result = getHumanReadableDate(date);
		expect(result).toBe('Fri Mar 15 2024 at 0:00am');
	});
});
