<script lang="ts">
	import { getHumanReadableDuration } from '../helpers/getHumanReadableDuration';
	import type { HistoryStats } from './helpers/computeStats';
	import type { StreakInfo } from '../helpers/sql/getStreakInfo';

	export let stats: HistoryStats;
	export let streakInfo: StreakInfo;
	export let puzzleCount: number;
</script>

<div>
	<h1>You've completed {puzzleCount} puzzles!</h1>
	<ul>
		<li>
			You've been at it for <strong>{getHumanReadableDuration(stats.totalTime)}</strong>.
		</li>
		<li>
			On average, a puzzle takes you <strong
				>{getHumanReadableDuration(stats.averagePuzzleTime)}</strong
			>.
		</li>
		<li>
			A typical puzzle takes you <strong>{getHumanReadableDuration(stats.medianPuzzleTime)}</strong
			>.
		</li>
		<li>
			You use the "check" feature on <strong>{stats.checkPercent}%</strong> of puzzles.
		</li>
		<li>
			You've used the "reveal" feature <strong>{stats.revealCount} times</strong>.
		</li>
		<li>
			Current streak <strong>{streakInfo.currentStreak} days</strong>.
		</li>
		<li>
			Longest streak <strong>{streakInfo.longestStreak} days</strong>.
		</li>
	</ul>
</div>
