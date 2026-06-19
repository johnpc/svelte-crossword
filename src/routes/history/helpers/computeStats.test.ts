import { describe, it, expect } from 'vitest';
import { computeStats } from './computeStats';
import type { UserHistoryEntry } from '../../helpers/sql/getUserHistory';

const makeEntry = (overrides: Partial<UserHistoryEntry> = {}): UserHistoryEntry => ({
	id: '1',
	profileId: 'p1',
	puzzleId: 'pz1',
	usedCheck: false,
	usedReveal: false,
	usedClear: false,
	timeInSeconds: 100,
	createdAt: '2024-01-01T00:00:00Z',
	...overrides
});

describe('computeStats', () => {
	it('returns zeroes for an empty array', () => {
		const stats = computeStats([]);
		expect(stats.averagePuzzleTime).toBe(0);
		expect(stats.medianPuzzleTime).toBe(0);
		expect(stats.checkPercent).toBe(0);
		expect(stats.revealCount).toBe(0);
		expect(stats.totalTime).toBe(0);
	});

	it('computes average correctly', () => {
		const puzzles = [
			makeEntry({ timeInSeconds: 60 }),
			makeEntry({ timeInSeconds: 120 }),
			makeEntry({ timeInSeconds: 180 })
		];
		const stats = computeStats(puzzles);
		expect(stats.averagePuzzleTime).toBe(120);
	});

	it('computes median for odd-length array', () => {
		const puzzles = [
			makeEntry({ timeInSeconds: 10 }),
			makeEntry({ timeInSeconds: 50 }),
			makeEntry({ timeInSeconds: 200 })
		];
		const stats = computeStats(puzzles);
		expect(stats.medianPuzzleTime).toBe(50);
	});

	it('computes median for even-length array', () => {
		const puzzles = [
			makeEntry({ timeInSeconds: 10 }),
			makeEntry({ timeInSeconds: 20 }),
			makeEntry({ timeInSeconds: 30 }),
			makeEntry({ timeInSeconds: 40 })
		];
		const stats = computeStats(puzzles);
		expect(stats.medianPuzzleTime).toBe(25);
	});

	it('computes check percent', () => {
		const puzzles = [
			makeEntry({ usedCheck: true }),
			makeEntry({ usedCheck: false }),
			makeEntry({ usedCheck: true }),
			makeEntry({ usedCheck: true })
		];
		const stats = computeStats(puzzles);
		expect(stats.checkPercent).toBe(75);
	});

	it('counts reveal usage', () => {
		const puzzles = [
			makeEntry({ usedReveal: true }),
			makeEntry({ usedReveal: false }),
			makeEntry({ usedReveal: true })
		];
		const stats = computeStats(puzzles);
		expect(stats.revealCount).toBe(2);
	});

	it('computes total time', () => {
		const puzzles = [makeEntry({ timeInSeconds: 100 }), makeEntry({ timeInSeconds: 200 })];
		const stats = computeStats(puzzles);
		expect(stats.totalTime).toBe(300);
	});
});
