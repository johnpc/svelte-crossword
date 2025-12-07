import type { Schema } from '../../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>({ authMode: 'userPool' });

export type StreakInfo = {
	longestStreak: number;
	currentStreak: number;
	allActivity: Array<{ date: Date; count: number }>;
};

const isSameDay = (a: Date, b: Date) =>
	a.getDate() === b.getDate() &&
	a.getMonth() === b.getMonth() &&
	a.getFullYear() === b.getFullYear();

export const getStreakInfo = async (profileId: string): Promise<StreakInfo> => {
	const userPuzzles = await client.models.SqlUserPuzzle.list({
		filter: { profile_id: { eq: profileId } },
		limit: 10000
	});

	const dateMap = new Map<string, number>();
	userPuzzles.data.forEach((up) => {
		const date = new Date(up.created_at).toDateString();
		dateMap.set(date, (dateMap.get(date) || 0) + 1);
	});

	const allActivity = Array.from(dateMap.entries())
		.map(([dateStr, count]) => ({ date: new Date(dateStr), count }))
		.sort((a, b) => b.date.getTime() - a.date.getTime());

	const today = new Date();
	const didTodaysPuzzle = allActivity.some((a) => isSameDay(a.date, today));

	let currentStreak = 0;
	const checkDate = new Date(today);
	if (!didTodaysPuzzle) checkDate.setDate(checkDate.getDate() - 1);

	while (allActivity.some((a) => isSameDay(a.date, checkDate))) {
		currentStreak++;
		checkDate.setDate(checkDate.getDate() - 1);
	}

	const sortedDates = allActivity.map((a) => a.date).sort((a, b) => a.getTime() - b.getTime());
	let longestStreak = 0;
	let tempStreak = 1;

	for (let i = 1; i < sortedDates.length; i++) {
		const diff = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
		if (diff === 1) {
			tempStreak++;
		} else {
			longestStreak = Math.max(longestStreak, tempStreak);
			tempStreak = 1;
		}
	}
	longestStreak = Math.max(longestStreak, tempStreak);

	return { longestStreak, currentStreak, allActivity };
};
