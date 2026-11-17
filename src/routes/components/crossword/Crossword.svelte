<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Toolbar from './Toolbar.svelte';
	import CrosswordPlay from './CrosswordPlay.svelte';
	import CrosswordComplete from './CrosswordComplete.svelte';
	import themeStyles from './helpers/themeStyles.js';
	import { checkClueCompletion } from './helpers/crosswordLogic.js';
	import { initializeCrosswordData, processToolbarAction } from './helpers/crosswordActions.js';
	import type { Cell, Clue, ClueInput, Direction, ToolMode } from './helpers/types';

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
	// @state-machine crossword-tool-mode — the ONE writer of `mode`; readers
	// derive isRevealing / isChecking below.
	let mode: ToolMode = 'idle',
		isLoaded = false,
		revealTimeout: ReturnType<typeof setTimeout> | undefined;
	let validated = false,
		clues: Clue[] = [],
		cells: Cell[] = [];
	// The clue set the grid was built from. Svelte invalidates object props on
	// every parent update (a timer tick is enough), so re-init only when the
	// parent hands over a DIFFERENT clue set — never for the same reference.
	let builtFrom: ClueInput[] | undefined;

	function resetFocus() {
		focusedCellIndex = 0;
		focusedDirection = 'across';
	}
	function initData() {
		if (data === builtFrom) return;
		builtFrom = data;
		// `revealed` is read here on purpose: a grid that opens already solved
		// (history detail, a finished preview) starts filled in. Only `data`
		// re-runs this block, so later `revealed` changes never re-init.
		const r = initializeCrosswordData(data, revealed);
		validated = r.validated;
		clues = r.clues;
		cells = r.cells;
		mode = 'idle';
		resetFocus();
	}

	function onToolbarEvent({ detail }: { detail: string }) {
		const effect = processToolbarAction(detail, { cells, mode, revealed, revealDuration });
		if (!effect) return;
		clearTimeout(revealTimeout);
		if (effect.cells) cells = effect.cells;
		mode = effect.mode;
		if (effect.resetFocus) resetFocus();
		if (effect.endRevealAfterMs !== undefined) {
			revealTimeout = setTimeout(() => {
				// Guarded: a Clear/Check that landed meanwhile already moved on.
				if (mode === 'revealing') mode = 'idle';
			}, effect.endRevealAfterMs);
		}
	}

	$: (data, initData());
	$: isRevealing = mode === 'revealing';
	$: isChecking = mode === 'checking';
	$: isComplete = cells.filter((d) => d.answer === d.value).length === cells.length;
	$: isDisableHighlight = isComplete && disableHighlight;
	$: (cells, (clues = checkClueCompletion(clues, cells)));
	$: (cells, (revealed = !clues.filter((d) => !d.isCorrect).length));
	$: stacked = width < breakpoint;
	onMount(() => (isLoaded = true));
	onDestroy(() => clearTimeout(revealTimeout));
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
