import type { HydratedProfile, HydratedUserPuzzle } from './types/types';
import { getAllUserPuzzles } from './getAllUserPuzzles';
export type StreakInfo = {
	longestStreak: number;
	currentStreak: number;
	allActivity: ActivityCalendar;
};
type ActivityCalendarItem = {
	date: Date;
	userPuzzles: HydratedUserPuzzle[];
};
type ActivityCalendar = ActivityCalendarItem[];

const isSameDay = (a: Date, b: Date) => {
	return (
		a.getDate() === b.getDate() &&
		a.getMonth() === b.getMonth() &&
		a.getFullYear() === b.getFullYear()
	);
};
const findCalendarItem = (activityCalendar: ActivityCalendar, date: Date): ActivityCalendarItem => {
	const existingItem = activityCalendar.find((activityCalendarItem) =>
		isSameDay(activityCalendarItem.date, date)
	);
	if (existingItem) {
		return existingItem;
	}

	const newItem = {
		date,
		userPuzzles: []
	} as ActivityCalendarItem;
	activityCalendar.push(newItem);
	return newItem;
};

const getActivityCalendar = (userPuzzles: HydratedUserPuzzle[]): ActivityCalendar => {
	const activityCalendar: ActivityCalendar = [];
	userPuzzles.forEach((userPuzzle) => {
		const activityCalendarItem = findCalendarItem(activityCalendar, new Date(userPuzzle.createdAt));
		activityCalendarItem.userPuzzles.push(userPuzzle);
	});
	return activityCalendar;
};

const getCurrentStreak = (activityCalendar: ActivityCalendar): number => {
	const today = new Date();
	let streakLength = 1;
	let hasActivity = true;
	const didTodaysPuzzle = activityCalendar.find((activityCalendarItem) =>
		isSameDay(activityCalendarItem.date, today)
	)
		? true
		: false;
	do {
		today.setTime(today.getTime() - streakLength * 24 * 3600 * 1000);
		const foundActivity = activityCalendar.find((activityCalendarItem) =>
			isSameDay(activityCalendarItem.date, today)
		);
		if (!foundActivity) {
			hasActivity = false;
		}
		streakLength++;
	} while (hasActivity);
	return streakLength - (didTodaysPuzzle ? 0 : 1);
};

const getLongestStreak = (activityCalendar: ActivityCalendar): number => {
	const dateArray = activityCalendar.map((activityCalendarItem) => activityCalendarItem.date);
	return (
		dateArray
			.map((d) => d.getTime())
			.reduce(
				function (res, n) {
					if (n) res[res.length - 1]++;
					else res.push(0);
					return res;
				},
				[0]
			)
			.pop() ?? 0
	);
};

export const getStreakInfo = async (profile: HydratedProfile): Promise<StreakInfo> => {
	const userPuzzles = await getAllUserPuzzles(profile);
	const allActivity = getActivityCalendar(userPuzzles);
	const longestStreak = getLongestStreak(allActivity);
	const currentStreak = getCurrentStreak(allActivity);
	const streakInfo = {
		longestStreak,
		currentStreak,
		allActivity
	};

	return streakInfo;
};
