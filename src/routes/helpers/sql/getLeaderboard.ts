import { invokeSqlQuery } from './invokeSqlQuery';

export type LeaderboardEntry = {
	id: string;
	name: string;
	email: string;
	completedCount: number;
};

export type LeaderboardResponse = {
	users: LeaderboardEntry[];
	total: number;
};

export const getLeaderboard = (): Promise<LeaderboardResponse> =>
	invokeSqlQuery<LeaderboardResponse>({ query: 'leaderboard' });
