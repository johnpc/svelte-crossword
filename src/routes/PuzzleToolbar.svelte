<script lang="ts">
	import { getHumanReadableDuration } from './helpers/getHumanReadableDuration';
	import { handleToolbarAction, navigateToHistory } from './helpers/puzzleGameLogic';
	import type { Assists, AssistKind } from './helpers/session/puzzleSession';

	export let elapsedSeconds: number;
	export let solved: boolean;
	export let assists: Assists;
	export let showAppKeyboard: boolean;
	export let showHistory = true;
	export let onClear: () => void;
	export let onReveal: () => void;
	export let onCheck: () => void;
	export let onAssist: (kind: AssistKind) => void;
	export let onToggleKeyboard: () => void;
	export let onContinue: () => void;

	const assist = (kind: AssistKind, engineAction: () => void) => () => {
		onAssist(kind);
		handleToolbarAction(engineAction);
	};
</script>

<div class="toolbar">
	<p id="timer">{getHumanReadableDuration(elapsedSeconds)}</p>
	{#if showHistory && !solved}
		<button class="history-button" on:click={navigateToHistory}>History</button>
	{/if}
	<button on:click={onToggleKeyboard} title="Toggle keyboard">
		{showAppKeyboard ? '⌨️' : '📱'}
	</button>
	<button class:active={assists.usedClear} on:click={assist('clear', onClear)}>Clear</button>
	<button class:active={assists.usedReveal} on:click={assist('reveal', onReveal)}>Reveal</button>
	<button class:active={assists.usedCheck} on:click={assist('check', onCheck)}>Check</button>
	{#if solved}
		<button class="next-puzzle-button" on:click={onContinue}>Continue</button>
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
	.history-button,
	.active {
		background-color: var(--secondary-highlight-color);
		color: aliceblue;
	}
	#timer {
		display: inline;
	}
</style>
