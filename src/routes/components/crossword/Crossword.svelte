<script lang="ts">
	import { onMount } from 'svelte';
	import Toolbar from './Toolbar.svelte';
	import CrosswordPlay from './CrosswordPlay.svelte';
	import CrosswordComplete from './CrosswordComplete.svelte';
	import themeStyles from './helpers/themeStyles.js';
	import { checkClueCompletion } from './helpers/crosswordLogic.js';
	import { initializeCrosswordData, processToolbarAction } from './helpers/crosswordActions.js';
	import type { Cell, Clue, ClueInput, Direction } from './helpers/types';

	export let data: ClueInput[] = [],
		actions: string[] = ['clear', 'reveal', 'check'],
		theme = 'classic';
	export let revealDuration = 1000,
		breakpoint = 720,
		revealed = false;
	export let disableHighlight = false,
		showCompleteMessage = true,
		showConfetti = true;
	export let showKeyboard: boolean | undefined = undefined,
		keyboardStyle = 'outline';
	export let isComplete = false;

	let width = 0,
		focusedDirection: Direction = 'across',
		focusedCellIndex = 0;
	let isRevealing = false,
		isLoaded = false,
		isChecking = false,
		revealTimeout: ReturnType<typeof setTimeout> | undefined;
	let validated = false,
		clues: Clue[] = [],
		cells: Cell[] = [];

	function reset() {
		isRevealing = isChecking = false;
		focusedCellIndex = 0;
		focusedDirection = 'across';
	}
	function initData() {
		const r = initializeCrosswordData(data);
		validated = r.validated;
		clues = r.clues;
		cells = r.cells;
		reset();
	}

	function onToolbarEvent({ detail }: { detail: string }) {
		const ctx = {
			cells,
			revealed,
			revealTimeout,
			revealDuration,
			endReveal: () => (isRevealing = false)
		};
		processToolbarAction(detail, ctx, (r) => {
			if (r.cells) cells = r.cells as Cell[];
			if (r.isRevealing) isRevealing = true;
			if (r.isChecking) isChecking = true;
			if (r.revealTimeout) revealTimeout = r.revealTimeout as ReturnType<typeof setTimeout>;
			if (r.reset) reset();
		});
	}

	$: (data, initData());
	$: isComplete = cells.filter((d) => d.answer === d.value).length === cells.length;
	$: isDisableHighlight = isComplete && disableHighlight;
	$: (cells, (clues = checkClueCompletion(clues, cells)));
	$: (cells, (revealed = !clues.filter((d) => !d.isCorrect).length));
	$: stacked = width < breakpoint;
	onMount(() => (isLoaded = true));
</script>

{#if validated}
	<article class="svelte-crossword" bind:offsetWidth={width} style={themeStyles[theme]}>
		<slot
			name="toolbar"
			onClear={() => onToolbarEvent({ detail: 'clear' })}
			onReveal={() => onToolbarEvent({ detail: 'reveal' })}
			onCheck={() => onToolbarEvent({ detail: 'check' })}
		>
			<Toolbar {actions} on:event={onToolbarEvent} />
		</slot>
		<CrosswordPlay
			{clues}
			{stacked}
			{isDisableHighlight}
			{isLoaded}
			{isRevealing}
			{isChecking}
			{revealDuration}
			{showKeyboard}
			{keyboardStyle}
			bind:focusedCellIndex
			bind:focusedDirection
			bind:cells
		/>
		<CrosswordComplete
			{isComplete}
			{isRevealing}
			{showCompleteMessage}
			{showConfetti}
			hasSlot={!!$$slots.message}
		>
			<slot name="message" />
		</CrosswordComplete>
	</article>
{/if}

<style>
	article {
		position: relative;
		background-color: transparent;
		font-size: 1rem;
	}
</style>
