<script lang="ts">
	import { onMount } from 'svelte';
	import type { Schema } from '../../../amplify/data/resource';
	import { generateClient } from 'aws-amplify/data';
	import { Amplify } from 'aws-amplify';
	import { getCurrentUser } from 'aws-amplify/auth';
	import type { AuthUser } from 'aws-amplify/auth';
	import { goto } from '$app/navigation';
	import config from '../../amplifyconfiguration.json';
	Amplify.configure(config);
	const client = generateClient<Schema>({
		authMode: 'userPool'
	});
	$: completedPuzzles = [] as Schema['UserPuzzle'][];
	$: currentUser = {} as AuthUser;
	onMount(() => {
		const setup = async () => {
			try {
				currentUser = await getCurrentUser();
			} catch (e) {
				goto('/login');
			}
			console.log({ currentUser });
			const userPuzzleResponse = await client.models.UserPuzzle.list({
				limit: 100
			});
			console.log({ userPuzzleResponse });
			completedPuzzles = userPuzzleResponse.data;
		};

		setup();
	});
</script>

{#if completedPuzzles.length === 0}
	<p>Loading...</p>
{:else}
	<p>You've completed {completedPuzzles.length} puzzles!</p>
	<p>
		You've used the "reveal" feature {completedPuzzles.filter(({ usedReveal }) => usedReveal)
			.length} times
	</p>
	<p>
		On average, a puzzle takes you {Math.floor(
			completedPuzzles
				.map(({ timeInSeconds }) => timeInSeconds)
				.reduce((acc, cur) => {
					return acc + cur;
				}, 0) / completedPuzzles.length
		)} seconds
	</p>
	<hr />
	<ul>
		{#each completedPuzzles as { id, userPuzzlePuzzleId, usedCheck, usedClear, usedReveal, timeInSeconds, createdAt }, i}
			<li>
				<ol>
					<li>id: {id}</li>
					<li>userPuzzlePuzzleId: {userPuzzlePuzzleId}</li>
					<li>usedCheck: {usedCheck}</li>
					<li>usedClear: {usedClear}</li>
					<li>usedReveal: {usedReveal}</li>
					<li>timeInSeconds: {timeInSeconds}</li>
					<li>createdAt: {createdAt}</li>
					<li>i: {i}</li>
				</ol>
				<hr />
			</li>
		{/each}
	</ul>
{/if}
