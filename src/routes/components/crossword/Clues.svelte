<script>
	import ClueList from './ClueList.svelte';
	import ClueBar from './ClueBar.svelte';
	import CluesContainer from './CluesContainer.svelte';
	import { getOppositeDirection, getNextClueIndex, getClueTarget } from './helpers/cluesLogic.js';

	export let clues;
	export let cellIndexMap;
	export let focusedDirection;
	export let focusedCellIndex;
	export let focusedCell;
	export let stacked;
	export let isDisableHighlight;
	export let isLoaded;

	$: focusedClueNumbers = focusedCell.clueNumbers || {};
	$: currentClue =
		clues.find(
			(c) => c.direction === focusedDirection && c.number === focusedClueNumbers[focusedDirection]
		) || {};

	function onClueFocus({ direction, id }) {
		const result = getClueTarget({
			direction,
			id,
			cellIndexMap,
			clues,
			focusedCellIndex,
			focusedDirection
		});
		focusedDirection = result.focusedDirection;
		focusedCellIndex = result.focusedCellIndex;
	}

	function onNextClue({ detail }) {
		const next = getNextClueIndex(detail, clues.length);
		const { direction, id } = clues[next];
		onClueFocus({ direction, id });
	}

	function onClueBarClicked() {
		const oppositeDirection = getOppositeDirection(focusedDirection);
		const oppositeClueNumber = focusedCell.clueNumbers?.[oppositeDirection];
		if (oppositeClueNumber) {
			focusedDirection = oppositeDirection;
		}
	}
</script>

<CluesContainer {stacked} {isLoaded}>
	<div class="clues--stacked" class:is-loaded={isLoaded} class:stacked>
		<ClueBar {currentClue} on:nextClue={onNextClue} on:clueBarClicked={onClueBarClicked} />
	</div>

	<div class="clues--list" class:is-loaded={isLoaded} class:stacked>
		{#each ['across', 'down'] as direction}
			<ClueList
				{direction}
				{focusedClueNumbers}
				clues={clues.filter((d) => d.direction === direction)}
				isDirectionFocused={focusedDirection === direction}
				{isDisableHighlight}
				{onClueFocus}
			/>
		{/each}
	</div>
</CluesContainer>

<style>
	.clues--stacked {
		margin: 0;
		display: none;
	}
	.clues--stacked.is-loaded.stacked {
		display: block;
	}
	.clues--list.is-loaded.stacked {
		display: none;
	}
	@media only screen and (max-width: 720px) {
		.clues--stacked:not(.is-loaded) {
			display: block;
		}
		.clues--list:not(.is-loaded) {
			display: none;
		}
	}
</style>
