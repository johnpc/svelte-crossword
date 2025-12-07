import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import config from '../../../amplify_outputs.json';

Amplify.configure(config);

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
	const session = await fetchAuthSession();
	const lambda = new LambdaClient({
		region: 'us-west-2',
		credentials: session.credentials
	});

	const functionName = (config.custom as { sqlQueriesFunctionName?: string })
		?.sqlQueriesFunctionName;
	if (!functionName) {
		throw new Error('SQL queries function name not found in config');
	}

	const command = new InvokeCommand({
		FunctionName: functionName,
		Payload: JSON.stringify({ query: 'getStreakInfo', profileId })
	});

	const response = await lambda.send(command);
	const payload = JSON.parse(new TextDecoder().decode(response.Payload));
	const rows = JSON.parse(payload.body);

	const dateMap = new Map<string, number>();
	rows.forEach((row: { created_at: string }) => {
		const date = new Date(row.created_at).toDateString();
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
