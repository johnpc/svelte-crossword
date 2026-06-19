import { describe, it, expect } from 'vitest';
import { getCalendarOptions } from './getCalendarOptions';
import type { StreakInfo } from '../../helpers/sql/getStreakInfo';

describe('getCalendarOptions', () => {
	it('returns empty events when streakInfo is undefined', () => {
		const options = getCalendarOptions(undefined);
		expect(options.view).toBe('dayGridMonth');
		expect(options.events).toEqual([]);
	});

	it('returns empty events when allActivity is empty', () => {
		const streakInfo: StreakInfo = {
			longestStreak: 0,
			currentStreak: 0,
			allActivity: []
		};
		const options = getCalendarOptions(streakInfo);
		expect(options.events).toEqual([]);
	});

	it('maps activity items to calendar events', () => {
		const date = new Date('2024-03-15');
		const streakInfo: StreakInfo = {
			longestStreak: 5,
			currentStreak: 3,
			allActivity: [{ date, count: 2 }]
		};
		const options = getCalendarOptions(streakInfo);
		expect(options.events).toHaveLength(1);
		expect(options.events[0].title).toBe('2 ✓');
		expect(options.events[0].backgroundColor).toBe('palevioletred');
		expect(options.events[0].start).toBe(date);
		expect(options.events[0].editable).toBe(false);
		expect(options.events[0].allDay).toBe(true);
	});

	it('includes the event-override class name', () => {
		const options = getCalendarOptions(undefined);
		expect(options.eventClassNames).toContain('event-override');
	});
});
