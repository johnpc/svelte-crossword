<script lang="ts">
	import { SyncLoader } from 'svelte-loading-spinners';
	import { onMount } from 'svelte';
	import { Amplify } from 'aws-amplify';
	import { getCurrentUser } from 'aws-amplify/auth';
	import { goto } from '$app/navigation';
	import { signOut, deleteUser } from 'aws-amplify/auth';
	import config from '../../amplify_outputs.json';
	import { resetPreviewSession } from '../preview/previewSession';
	import { getStreakInfo } from '../helpers/sql/getStreakInfo';
	import { getUserHistory } from '../helpers/sql/getUserHistory';
	import { getOrCreateProfile } from '../helpers/sql/getOrCreateProfile';
	import { getCalendarOptions } from './helpers/getCalendarOptions';
	import { computeStats } from './helpers/computeStats';
	import { loadHistoryData, deleteAllUserData, type HistoryData } from './helpers/historyPageLogic';
	import { loading, settle, type RemoteData } from '../helpers/remoteData';
	import HistoryStats from './HistoryStats.svelte';
	import HistoryEntry from './HistoryEntry.svelte';
	import { Calendar, DayGrid } from '@event-calendar/core';
	import '@event-calendar/core/index.css';

	const plugins = [DayGrid];
	Amplify.configure(config);

	// @state-machine history-load — loading | ready(data) | failed(message)
	let history: RemoteData<HistoryData> = loading();

	onMount(() => {
		(async () => {
			const settled = await settle(
				() =>
					loadHistoryData({
						getCurrentUser,
						getOrCreateProfile,
						getUserHistory,
						getStreakInfo,
						onUnauthenticated: () => goto('/login')
					}),
				'Could not load your history. Please try again later.'
			);
			if (settled) history = settled;
		})();
	});

	const handleDeleteAllData = () =>
		deleteAllUserData({
			confirm,
			resetLocalState: resetPreviewSession,
			deleteUser,
			signOut,
			onComplete: () => goto('/login')
		});
</script>

{#if history.status === 'loading'}
	<div style="margin: auto">
		<SyncLoader size="60" color="palevioletred" unit="px" duration="1s" />
	</div>
{:else if history.status === 'failed'}
	<p role="alert">{history.message}</p>
{:else if history.data.completedPuzzles.length === 0}
	<p>
		You have not completed any puzzles.
		<button type="button" class="link-button" on:click={() => goto('/')}>Go Back</button>
	</p>
{:else}
	<Calendar {plugins} options={getCalendarOptions(history.data.streakInfo)} />
	<HistoryStats
		stats={computeStats(history.data.completedPuzzles)}
		streakInfo={history.data.streakInfo}
		puzzleCount={history.data.completedPuzzles.length}
	/>
	<hr />
	{#each history.data.completedPuzzles as puzzle}
		<HistoryEntry {...puzzle} />
	{/each}
{/if}
<hr />
<div id="privacy">
	<p>We value your <a href="/privacy-policy.html">privacy</a>.</p>
	<p>
		<button type="button" class="link-button" on:click={() => handleDeleteAllData()}
			>Delete my account and all my data.</button
		>
	</p>
</div>

<style>
	:global(ul) {
		list-style-type: none;
	}
	:global(li) {
		margin-bottom: 5px;
	}
	#privacy {
		font-size: xx-small;
	}
	.link-button {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		text-decoration: underline;
		cursor: pointer;
	}
</style>
