<script lang="ts">
	import PuzzleCells from './PuzzleCells.svelte';
	import getSecondarilyFocusedCells from './helpers/getSecondarilyFocusedCells.js';
	import type { Cell, Direction, PuzzleAction } from './helpers/types';

	export let cells: Cell[];
	export let w: number;
	export let h: number;
	export let focusedCellIndex: number;
	export let focusedCell: Cell;
	export let focusedDirection: Direction;
	export let isRevealing: boolean;
	export let isChecking: boolean;
	export let isDisableHighlight: boolean;
	export let revealDuration: number;
	export let keyboardVisible: boolean;
	export let isLoaded: boolean;
	export let stacked: boolean;
	export let act: (action: PuzzleAction) => void;
	export let onNativeKeydown: (e: KeyboardEvent) => void;
	export let hiddenInputBinding: HTMLInputElement | undefined = undefined;

	let element: HTMLElement | undefined;
	export function getElement() {
		return element;
	}

	$: secondarilyFocusedCells = getSecondarilyFocusedCells({ cells, focusedDirection, focusedCell });
</script>

{#if !keyboardVisible}
	<input
		bind:this={hiddenInputBinding}
		on:keydown={onNativeKeydown}
		style="position: fixed; left: -9999px; width: 1px; height: 1px;"
		type="text"
		inputmode="text"
		autocomplete="off"
		autocorrect="off"
		autocapitalize="characters"
		aria-hidden="true"
	/>
{/if}
<section class="puzzle" class:stacked class:is-loaded={isLoaded} bind:this={element}>
	<PuzzleCells
		{cells}
		{w}
		{h}
		{focusedCellIndex}
		{isDisableHighlight}
		{isRevealing}
		{isChecking}
		{revealDuration}
		{keyboardVisible}
		{secondarilyFocusedCells}
		{act}
	/>
</section>

<style>
	section {
		position: sticky;
		top: 1em;
		order: 0;
		flex: 1;
		height: fit-content;
	}
	section.is-loaded.stacked {
		position: relative;
		top: auto;
		height: auto;
		order: -1;
	}
	@media only screen and (max-width: 720px) {
		section:not(.is-loaded) {
			position: relative;
			top: auto;
			height: auto;
			order: -1;
		}
	}
</style>
