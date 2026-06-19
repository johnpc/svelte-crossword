<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Haptics, ImpactStyle } from '@capacitor/haptics';
	import { haptic } from '../../helpers/haptics';
	import type { Clue } from './helpers/types';

	const dispatch = createEventDispatcher<{ nextClue: number; clueBarClicked: Partial<Clue> }>();
	const buttonHandler = (index: number) => {
		haptic();
		dispatch('nextClue', index);
	};

	const handleClueBarClicked = (currentClue: Partial<Clue>) => {
		dispatch('clueBarClicked', currentClue);
	};

	export let currentClue: Partial<Clue> = {};
	$: clue = currentClue['clue'];
	$: custom = currentClue['custom'] || '';
</script>

<div class="bar {custom}">
	<button aria-label="Previous clue" on:click={() => buttonHandler(currentClue.index! - 1)}>
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="feather feather-chevron-left"
		>
			<polyline points="15 18 9 12 15 6"></polyline>
		</svg>
	</button>
	<button class="clue-text" on:click={() => handleClueBarClicked(currentClue)}>{clue}</button>
	<button aria-label="Next clue" on:click={() => buttonHandler(currentClue.index! + 1)}>
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="feather feather-chevron-right"
		>
			<polyline points="9 18 15 12 9 6"></polyline>
		</svg>
	</button>
</div>

<style>
	.bar {
		width: 100%;
		display: flex;
		justify-content: space-between;
		background-color: var(--secondary-highlight-color);
		align-items: center;
	}

	.clue-text {
		flex: 1;
		padding: 0 1em;
		line-height: 1.325;
		font-family: var(--font);
		font-size: 1.2em;
		text-align: left;
		cursor: pointer;
		border: none;
		color: var(--main-color);
		background-color: transparent;
	}

	button {
		cursor: pointer;
		font-size: 1em;
		border: none;
		line-height: 1;
		color: var(--main-color);
		background-color: transparent;
	}
</style>
