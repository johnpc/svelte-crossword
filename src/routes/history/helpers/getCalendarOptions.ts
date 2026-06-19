import type { StreakInfo } from '../../helpers/sql/getStreakInfo';

export type CalendarOptions = {
	view: string;
	eventClassNames: string[];
	events: Array<{
		title: string;
		editable: boolean;
		startEditable: boolean;
		durationEditable: boolean;
		backgroundColor: string;
		textColor: string;
		start: Date;
		allDay: boolean;
		end: Date;
	}>;
};

export const getCalendarOptions = (streakInfo?: StreakInfo): CalendarOptions => ({
	view: 'dayGridMonth',
	eventClassNames: ['event-override'],
	events:
		streakInfo?.allActivity.map((activityItem) => ({
			title: `${activityItem.count} ✓`,
			editable: false,
			startEditable: false,
			durationEditable: false,
			backgroundColor: 'palevioletred',
			textColor: 'white',
			start: activityItem.date,
			allDay: true,
			end: new Date(activityItem.date.getTime() + 1)
		})) ?? []
});
