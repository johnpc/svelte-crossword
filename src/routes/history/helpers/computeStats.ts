import type { UserHistoryEntry } from '../../helpers/sql/getUserHistory';

export type HistoryStats = {
	averagePuzzleTime: number;
	medianPuzzleTime: number;
	checkPercent: number;
	revealCount: number;
	totalTime: number;
};

export const computeStats = (puzzles: UserHistoryEntry[]): HistoryStats => {
	if (puzzles.length === 0) {
		return {
			averagePuzzleTime: 0,
			medianPuzzleTime: 0,
			checkPercent: 0,
			revealCount: 0,
			totalTime: 0
		};
	}

	const times = puzzles.map(({ timeInSeconds }) => timeInSeconds);
	const totalTime = times.reduce((acc, cur) => acc + cur, 0);
	const averagePuzzleTime = Math.floor(totalTime / puzzles.length);

	const sorted = [...times].sort((a, b) => a - b);
	const middleIndex = Math.floor(sorted.length / 2);
	const medianPuzzleTime =
		sorted.length % 2 === 0
			? (sorted[middleIndex - 1] + sorted[middleIndex]) / 2
			: sorted[middleIndex];

	const checkPercent = Math.floor(
		(puzzles.filter(({ usedCheck }) => usedCheck).length / puzzles.length) * 100
	);

	const revealCount = puzzles.filter(({ usedReveal }) => usedReveal).length;

	return { averagePuzzleTime, medianPuzzleTime, checkPercent, revealCount, totalTime };
};
