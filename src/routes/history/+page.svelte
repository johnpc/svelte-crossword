<script lang="ts">
	import { SyncLoader } from 'svelte-loading-spinners';
	import { onMount } from 'svelte';
	import { Amplify } from 'aws-amplify';
	import { getCurrentUser } from 'aws-amplify/auth';
	import type { AuthUser } from 'aws-amplify/auth';
	import { goto } from '$app/navigation';
	import { signOut, deleteUser } from 'aws-amplify/auth';
	import config from '../../amplify_outputs.json';
	import { resetPuzzleStoreDefaults } from '../helpers/puzzleStore';
	import { getStreakInfo, type StreakInfo } from '../helpers/sql/getStreakInfo';
	import { getUserHistory, type UserHistoryEntry } from '../helpers/sql/getUserHistory';
	import { getOrCreateProfile } from '../helpers/sql/getOrCreateProfile';
	import { getCalendarOptions } from './helpers/getCalendarOptions';
	import { computeStats } from './helpers/computeStats';
	import HistoryStats from './HistoryStats.svelte';
	import HistoryEntry from './HistoryEntry.svelte';
	import Calendar from '@event-calendar/core';
	import DayGrid from '@event-calendar/day-grid';
	import '@event-calendar/core/index.css';

	const plugins = [DayGrid];
	Amplify.configure(config);

	$: completedPuzzles = [] as UserHistoryEntry[];
	$: streakInfo = {} as StreakInfo;
	$: currentUser = {} as AuthUser;
	$: isLoading = true;

	onMount(() => {
		const setup = async () => {
			try {
				currentUser = await getCurrentUser();
			} catch (e) {
				goto('/login');
			}
			const profile = await getOrCreateProfile();
			completedPuzzles = await getUserHistory(profile.id);
			streakInfo = await getStreakInfo(profile.id);
			isLoading = false;
		};
		setup();
	});

	const handleDeleteAllData = async () => {
		const confirmed = confirm(
			'Are you sure? This will destroy your account and log you out immediately. It cannot be undone.'
		);
		if (!confirmed) return;
		resetPuzzleStoreDefaults();
		await deleteUser();
		await signOut();
		goto('/login');
	};
</script>

{#if isLoading}
	<p style="margin: auto"><SyncLoader size="60" color="palevioletred" unit="px" duration="1s" /></p>
{:else if completedPuzzles.length === 0}
	<p>You have not completed any puzzles. <a href="#" on:click={() => goto('/')}>Go Back</a></p>
{:else}
	<Calendar {plugins} options={getCalendarOptions(streakInfo)} />
	<HistoryStats
		stats={computeStats(completedPuzzles)}
		{streakInfo}
		puzzleCount={completedPuzzles.length}
	/>
	<hr />
	{#each completedPuzzles as puzzle}
		<HistoryEntry {...puzzle} />
	{/each}
{/if}
<hr />
<div id="privacy">
	<p>We value your <a href="/privacy-policy.html">privacy</a>.</p>
	<p><a href="#" on:click={() => handleDeleteAllData()}>Delete my account and all my data.</a></p>
</div>

<style>
	:global(ul) {
		list-style-type: none;
	}
	:global(li) {
		margin-bottom: 5px;
	}
	#privacy {
		text-size: xx-small;
	}
</style>
