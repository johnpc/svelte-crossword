<script lang="ts">
	import { SyncLoader } from 'svelte-loading-spinners';
	import { onMount } from 'svelte';
	import type { Schema } from '../../../amplify/data/resource';
	import { generateClient } from 'aws-amplify/data';
	import { Amplify } from 'aws-amplify';
	import config from '../../amplifyconfiguration.json';
	import LeaderboardItem from './LeaderboardItem.svelte';
	import { getAllUserPuzzles } from '../helpers/getAllUserPuzzles';

	Amplify.configure(config);
	const client = generateClient<Schema>({
		authMode: 'iam'
	});
	$: profiles = [] as Schema['Profile'][];
	$: isLoading = true;

	onMount(() => {
		const setup = async () => {
			const profileResponse = await client.models.Profile.list();
			const profileData = profileResponse.data.length ? profileResponse.data : [];
			const profilesWithCompletedPuzzleCountPromises = profileData.map(async (profile) => {
				const completedPuzzlesResponse = await getAllUserPuzzles(profile, true);
				const completedPuzzlesCount = completedPuzzlesResponse.length;
				return { ...profile, completedPuzzlesCount };
			});
			const profilesWithCompletedPuzzleCount = await Promise.all(
				profilesWithCompletedPuzzleCountPromises
			);
			profilesWithCompletedPuzzleCount.sort(
				(a: { completedPuzzlesCount: number }, b: { completedPuzzlesCount: number }) => {
					return a.completedPuzzlesCount < b.completedPuzzlesCount ? 1 : -1;
				}
			);
			profiles = profilesWithCompletedPuzzleCount;
			isLoading = false;
		};

		setup();
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
	{/if}
</div>
