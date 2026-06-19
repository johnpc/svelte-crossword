<script lang="ts">
	import Clues from './Clues.svelte';
	import Puzzle from './Puzzle.svelte';
	import type { Cell, Clue, Direction, CellIndexMap } from './helpers/types';

	export let clues: Clue[];
	export let stacked: boolean;
	export let isDisableHighlight: boolean;
	export let isLoaded: boolean;
	export let focusedCellIndex: number;
	export let focusedDirection: Direction;
	export let isRevealing: boolean;
	export let isChecking: boolean;
	export let revealDuration: number;
	export let showKeyboard: boolean | undefined;
	export let keyboardStyle: string;
	export let cells: Cell[];

	$: focusedCell = (cells[focusedCellIndex] || {}) as Cell;
	$: cellIndexMap = Object.fromEntries(cells.map((cell) => [cell.id, cell.index])) as CellIndexMap;
</script>

<div class="play" class:stacked class:is-loaded={isLoaded}>
	<Clues
		{clues}
		{cellIndexMap}
		{stacked}
		{isDisableHighlight}
		{isLoaded}
		bind:focusedCellIndex
		bind:focusedCell
		bind:focusedDirection
	/>
	<Puzzle
		{clues}
		{focusedCell}
		{isRevealing}
		{isChecking}
		{isDisableHighlight}
		{revealDuration}
		{showKeyboard}
		{stacked}
		{isLoaded}
		{keyboardStyle}
		bind:cells
		bind:focusedCellIndex
		bind:focusedDirection
	/>
</div>

<style>
	.play {
		display: flex;
		flex-direction: var(--order, row);
	}
	.play.is-loaded.stacked {
		flex-direction: column;
	}
	@media only screen and (max-width: 720px) {
		.play:not(.is-loaded) {
			flex-direction: column;
		}
	}
</style>
