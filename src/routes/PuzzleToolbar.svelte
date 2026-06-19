<script lang="ts">
	import { getHumanReadableDuration } from './helpers/getHumanReadableDuration';
	import { handleToolbarAction, navigateToHistory } from './helpers/puzzleGameLogic';

	export let timeInSeconds: number;
	export let isPuzzleComplete: boolean;
	export let usedClear: boolean;
	export let usedReveal: boolean;
	export let usedCheck: boolean;
	export let showAppKeyboard: boolean;
	export let onClear: () => void;
	export let onReveal: () => void;
	export let onCheck: () => void;
	export let onToggleKeyboard: () => void;
	export let onNextPuzzle: () => void;

	const toolbarClear = () => {
		usedClear = true;
		handleToolbarAction(onClear);
	};
	const toolbarReveal = () => {
		usedReveal = true;
		handleToolbarAction(onReveal);
	};
	const toolbarCheck = () => {
		usedCheck = true;
		handleToolbarAction(onCheck);
	};
</script>

<div class="toolbar">
	<p id="timer">{getHumanReadableDuration(timeInSeconds)}</p>
	{#if !isPuzzleComplete}
		<button class="history-button" on:click={navigateToHistory}>History</button>
	{/if}
	<button on:click={onToggleKeyboard} title="Toggle keyboard">
		{showAppKeyboard ? '⌨️' : '📱'}
	</button>
	<button class={usedClear ? 'active' : ''} on:click={toolbarClear}>Clear</button>
	<button class={usedReveal ? 'active' : ''} on:click={toolbarReveal}>Reveal</button>
	<button class={usedCheck ? 'active' : ''} on:click={toolbarCheck}>Check</button>
	{#if isPuzzleComplete}
		<button class="next-puzzle-button" on:click={onNextPuzzle}>Continue</button>
	{/if}
</div>

<style>
	.toolbar {
		margin-bottom: 1em;
		padding: 1em 0;
		display: flex;
		justify-content: flex-end;
		font-family: var(--font);
		font-size: 0.85em;
		background-color: transparent;
	}
	button {
		cursor: pointer;
		margin-left: 1em;
		font-size: 1em;
		font-family: var(--font);
		background-color: var(--accent-color);
		border-radius: 4px;
		color: var(--main-color);
		padding: 0.75em;
		border: none;
		font-weight: 400;
		transition: background-color 150ms;
	}
	button:hover {
		background-color: var(--primary-highlight-color);
	}
	.next-puzzle-button,
	.history-button {
		background-color: var(--secondary-highlight-color);
		color: aliceblue;
	}
	#timer {
		display: inline;
	}
	.active {
		color: aliceblue;
		background-color: var(--secondary-highlight-color);
	}
</style>
