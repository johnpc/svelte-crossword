<script lang="ts">
	import { SyncLoader } from 'svelte-loading-spinners';
	import { onMount } from 'svelte';
	import { Amplify } from 'aws-amplify';
	import { toast } from '@zerodevx/svelte-toast';
	import config from '../../amplify_outputs.json';
	import LeaderboardItem from './LeaderboardItem.svelte';
	import { getLeaderboard, type LeaderboardResponse } from '../helpers/sql/getLeaderboard';
	import { loading, settle, type RemoteData } from '../helpers/remoteData';

	Amplify.configure(config);
	// @state-machine leaderboard-load — loading | ready(data) | failed(message)
	let board: RemoteData<LeaderboardResponse> = loading();

	onMount(() => {
		(async () => {
			const settled = await settle(
				getLeaderboard,
				'Could not load the leaderboard. Please try again later.'
			);
			if (!settled) return;
			board = settled;
			if (settled.status === 'failed') toast.push(settled.message);
		})();
	});
</script>

<svelte:head>
	<title>Leaderboard</title>
	<meta name="description" content="Most active puzzle-solvers" />
</svelte:head>

<div class="text-column">
	<h1>Leaderboard</h1>
	{#if board.status === 'loading'}
		<div style="margin: auto">
			<SyncLoader size="60" color="palevioletred" unit="px" duration="1s" />
		</div>
	{:else if board.status === 'failed'}
		<p role="alert">{board.message}</p>
	{:else}
		<ol>
			{#each board.data.users as profile}
				<LeaderboardItem {profile} />
			{/each}
		</ol>
		<p>Total users: {board.data.total}</p>
	{/if}
</div>
