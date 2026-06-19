import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import HistoryStats from './HistoryStats.svelte';

const stats = {
	totalTime: 3600,
	averagePuzzleTime: 120,
	medianPuzzleTime: 90,
	checkPercent: 25,
	revealCount: 4
};

const streakInfo = {
	currentStreak: 3,
	longestStreak: 7,
	allActivity: []
};

describe('HistoryStats', () => {
	it('renders the puzzle count headline', () => {
		const { getByText } = render(HistoryStats, {
			props: { stats, streakInfo, puzzleCount: 42 }
		});
		expect(getByText(/completed 42 puzzles/)).toBeInTheDocument();
	});

	it('renders streak and feature-usage figures', () => {
		const { getByText } = render(HistoryStats, {
			props: { stats, streakInfo, puzzleCount: 42 }
		});
		expect(getByText('25%')).toBeInTheDocument();
		expect(getByText('4 times')).toBeInTheDocument();
		expect(getByText('3 days')).toBeInTheDocument();
		expect(getByText('7 days')).toBeInTheDocument();
	});
});
