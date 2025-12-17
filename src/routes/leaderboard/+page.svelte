<script lang="ts">
	import { SyncLoader } from 'svelte-loading-spinners';
	import { onMount } from 'svelte';
	import { Amplify } from 'aws-amplify';
	import config from '../../amplify_outputs.json';
	import LeaderboardItem from './LeaderboardItem.svelte';
	import { getLeaderboard, type LeaderboardEntry } from '../helpers/sql/getLeaderboard';

	Amplify.configure(config);
	$: profiles = [] as LeaderboardEntry[];
	$: totalUsers = 0;
	$: isLoading = true;

	onMount(() => {
		const setup = async () => {
			const result = await getLeaderboard();
			profiles = result.users;
			totalUsers = result.total;
			isLoading = false;
		};

		setup().catch((reason) => console.log({ reason }));
	});
</script>

<svelte:head>
	<title>Leaderboard</title>
	<meta name="description" content="Most active puzzle-solvers" />
</svelte:head>

<div class="text-column">
	<h1>Leaderboard</h1>
	{#if isLoading}
		<p style="margin: auto">
			<SyncLoader size="60" color="palevioletred" unit="px" duration="1s" />
		</p>
	{:else}
		<ol>
			{#each profiles ?? [] as profile, i}
				<LeaderboardItem {profile} />
			{/each}
		</ol>
		<p>Total users: {totalUsers}</p>
	{/if}
</div>
