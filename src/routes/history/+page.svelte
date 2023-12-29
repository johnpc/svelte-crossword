<script lang="ts">
	import { onMount } from 'svelte';
	import type { Schema } from '../../../amplify/data/resource';
	import { generateClient } from 'aws-amplify/data';
	import { Amplify } from 'aws-amplify';
	import { getCurrentUser } from 'aws-amplify/auth';
	import type { AuthUser } from 'aws-amplify/auth';
	import { goto } from '$app/navigation';
	import { signOut, deleteUser } from 'aws-amplify/auth';
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
	const getHumanReadableDate = (date: Date) => {
		const timeSuffix = date.getHours() < 12 ? 'am' : 'pm';
		const hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
		const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
		return `${date.toDateString()} at ${hours}:${minutes}${timeSuffix}`;
	};
	const handleDeleteAllData = async () => {
		const confirmed = confirm(
			'Are you sure? This will destroy your account and log you out immediately. It cannot be undone.'
		);
		if (!confirmed) {
			return;
		}
		await deleteUser();
		await signOut();
		goto('/login');
	};
</script>

{#if completedPuzzles.length === 0}
	<p>Loading...</p>
{:else}
	<div>
		<h1>You've completed {completedPuzzles.length} puzzles!</h1>
		<h3>
			On average, a puzzle takes you {Math.floor(
				completedPuzzles
					.map(({ timeInSeconds }) => timeInSeconds)
					.reduce((acc, cur) => {
						return acc + cur;
					}, 0) / completedPuzzles.length
			)} seconds.
		</h3>
		<p>
			You've used the "reveal" feature {completedPuzzles.filter(({ usedReveal }) => usedReveal)
				.length} times.
		</p>
	</div>
	<hr />
	{#each completedPuzzles as { id, usedCheck, usedClear, usedReveal, timeInSeconds, createdAt }, i}
		<div>
			<h2>
				<a href={`#${id}`} on:click={() => goto(`/history/id?id=${id}`)}
					>Puzzle on {getHumanReadableDate(new Date(createdAt))}</a
				>
			</h2>
			<span>Solved in {timeInSeconds} seconds.</span>
			<ul {id}>
				<li>usedCheck: {usedCheck ? '✅' : '❌'}</li>
				<li>usedClear: {usedClear ? '✅' : '❌'}</li>
				<li>usedReveal: {usedReveal ? '✅' : '❌'}</li>
			</ul>
			<hr />
		</div>
	{/each}
	<hr />
	<div style="text-size: xx-small">
		<p>We value your privacy.</p>
		<p><a href="#" on:click={() => handleDeleteAllData()}>Delete all my data.</a></p>
	</div>
{/if}
