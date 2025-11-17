<script>
	import ClueList from './ClueList.svelte';
	import ClueBar from './ClueBar.svelte';
	import Clue from './Clue.svelte';

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
		const targetCellIndex = cellIndexMap[id] || 0;
		console.log('onClueFocus', { direction, id, targetCellIndex, focusedCellIndex, focusedDirection });
		if (focusedCellIndex === targetCellIndex && focusedDirection === direction) {
			console.log('Same cell and direction - flipping');
			const oppositeDirection = direction === 'across' ? 'down' : 'across';
			const cell = Object.entries(cellIndexMap).find(([cellId, idx]) => idx === targetCellIndex);
			if (cell) {
				const [cellId] = cell;
				const hasOppositeClue = clues.some(c => c.direction === oppositeDirection && c.id === cellId);
				console.log('hasOppositeClue', hasOppositeClue, oppositeDirection);
				if (hasOppositeClue) {
					focusedDirection = oppositeDirection;
				}
			}
		} else {
			console.log('Different cell or direction - setting normally');
			focusedDirection = direction;
			focusedCellIndex = targetCellIndex;
		}
	}

	function onNextClue({ detail }) {
		let next = detail;
		if (next < 0) next = clues.length - 1;
		else if (next > clues.length - 1) next = 0;
		const { direction, id } = clues[next];
		onClueFocus({ direction, id });
	}

	function onClueBarClicked({ detail }) {
		const oppositeDirection = focusedDirection === 'across' ? 'down' : 'across';
		const oppositeClueNumber = focusedCell.clueNumbers?.[oppositeDirection];
		
		if (oppositeClueNumber) {
			focusedDirection = oppositeDirection;
		}
	}
</script>

<section class="clues" class:stacked class:is-loaded={isLoaded}>
	<div class="clues--stacked">
		<ClueBar {currentClue} on:nextClue={onNextClue} on:clueBarClicked={onClueBarClicked} />
	</div>

	<div class="clues--list">
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
</section>

<style>
	section {
		position: sticky;
		top: 1em;
		flex: 0 1 16em;
		height: fit-content;
		margin: 0;
		margin-right: 1em;
	}

	section.is-loaded.stacked {
		position: static;
		height: auto;
		top: auto;
		display: block;
		margin: 1em 0;
		flex: auto;
	}

	.clues--stacked {
		margin: 0;
		display: none;
	}

	.is-loaded.stacked .clues--stacked {
		display: block;
	}

	.is-loaded.stacked .clues--list {
		display: none;
	}

	@media only screen and (max-width: 720px) {
		section:not(.is-loaded) {
			position: static;
			height: auto;
			top: auto;
			display: block;
			margin: 1em 0;
			flex: auto;
		}

		.clues--stacked:not(.is-loaded) {
			display: block;
		}

		.clues--list:not(.is-loaded) {
			display: none;
		}
	}
</style>
