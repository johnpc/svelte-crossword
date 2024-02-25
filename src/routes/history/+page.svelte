<script lang="ts">
	import { SyncLoader } from 'svelte-loading-spinners';
	import { onMount } from 'svelte';
	import type { Schema } from '../../../amplify/data/resource';
	import { generateClient } from 'aws-amplify/data';
	import { Amplify } from 'aws-amplify';
	import { getCurrentUser } from 'aws-amplify/auth';
	import type { AuthUser } from 'aws-amplify/auth';
	import { goto } from '$app/navigation';
	import { signOut, deleteUser } from 'aws-amplify/auth';
	import config from '../../amplifyconfiguration.json';
	import { getHumanReadableDuration } from '../helpers/getHumanReadableDuration';
	import { getAllUserPuzzles } from '../helpers/getAllUserPuzzles';
	import { getOrCreateProfile } from '../helpers/getOrCreateProfile';
	import { resetPuzzleStoreDefaults } from '../helpers/puzzleStore';
	import type { HydratedUserPuzzle } from '../helpers/types/types';
	Amplify.configure(config);
	const client = generateClient<Schema>({
		authMode: 'userPool'
	});
	$: completedPuzzles = [] as HydratedUserPuzzle[];
	$: currentUser = {} as AuthUser;
	$: isLoading = true;
	onMount(() => {
		const setup = async () => {
			try {
				currentUser = await getCurrentUser();
			} catch (e) {
				goto('/login');
			}
			console.log({ currentUser });
			const profile = await getOrCreateProfile(client, true);
			const userPuzzleResponse = await getAllUserPuzzles(profile, true);
			console.log({ userPuzzleResponse });
			completedPuzzles = userPuzzleResponse;
			isLoading = false;
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
	{@const averagePuzzleTime = Math.floor(
		completedPuzzles
			.map(({ timeInSeconds }) => timeInSeconds)
			.reduce((acc, cur) => {
				return acc + cur;
			}, 0) / completedPuzzles.length
	)}
	{@const checkPercent = Math.floor(
		(completedPuzzles.filter(({ usedCheck }) => usedCheck).length / completedPuzzles.length) * 100
	)}
	{@const medianPuzzleTime = () => {
		const sorted = [...completedPuzzles].sort((a, b) => a.timeInSeconds - b.timeInSeconds);
		const middleIndex = Math.floor(sorted.length / 2);

		if (sorted.length % 2 === 0) {
			return (sorted[middleIndex - 1].timeInSeconds + sorted[middleIndex].timeInSeconds) / 2;
		} else {
			return sorted[middleIndex].timeInSeconds;
		}
	}}

	<div>
		<h1>You've completed {completedPuzzles.length} puzzles!</h1>
		<ul>
			<li>
				You've been at it for <strong
					>{getHumanReadableDuration(averagePuzzleTime * completedPuzzles.length)}</strong
				>.
			</li>
			<li>
				On average, a puzzle takes you <strong>{getHumanReadableDuration(averagePuzzleTime)}</strong
				>.
			</li>
			<li>
				A typical puzzle takes you <strong>{getHumanReadableDuration(medianPuzzleTime())}</strong>.
			</li>
			<li>
				You use the "check" feature on <strong>{checkPercent}%</strong> of puzzles.
			</li>
			<li>
				You've used the "reveal" feature <strong
					>{completedPuzzles.filter(({ usedReveal }) => usedReveal).length} times</strong
				>.
			</li>
		</ul>
	</div>
	<hr />
	{#each completedPuzzles as { id, usedCheck, usedClear, usedReveal, timeInSeconds, createdAt }, i}
		<div>
			<h2>
				<a href={`#${id}`} on:click={() => goto(`/history/id?id=${id}`)}
					>Puzzle on {getHumanReadableDate(new Date(createdAt))}</a
				>
			</h2>
			<span>Solved in {getHumanReadableDuration(timeInSeconds)} seconds.</span>
			<ul {id}>
				{#if usedClear}
					<li>🧹 Used Clear 🧹</li>
				{/if}
				{#if usedCheck}
					<li>🔎 Used Check 🔎</li>
				{/if}
				{#if usedReveal}
					<li>🚨 Used Reveal 🚨</li>
				{/if}
			</ul>
			<hr />
		</div>
	{/each}
{/if}
<hr />
<div id="privacy">
	<p>We value your <a href="/privacy-policy.html">privacy</a>.</p>
	<p><a href="#" on:click={() => handleDeleteAllData()}>Delete my account and all my data.</a></p>
</div>

<style>
	ul {
		list-style-type: none;
	}
	li {
		margin-bottom: 5px;
	}
	#privacy {
		text-size: xx-small;
	}
</style>
