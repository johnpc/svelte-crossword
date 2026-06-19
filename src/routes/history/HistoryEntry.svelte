<script lang="ts">
	import { goto } from '$app/navigation';
	import { getHumanReadableDuration } from '../helpers/getHumanReadableDuration';
	import { getHumanReadableDate } from './helpers/getHumanReadableDate';

	export let id: string;
	export let usedCheck: boolean;
	export let usedClear: boolean;
	export let usedReveal: boolean;
	export let timeInSeconds: number;
	export let createdAt: string;
</script>

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
