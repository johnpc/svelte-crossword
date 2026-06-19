<script lang="ts">
	import Crossword from '../components/crossword/Crossword.svelte';
	import { getHumanReadableDuration } from '../helpers/getHumanReadableDuration';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { onToolbarClear, onToolbarReveal, onToolbarCheck } from './helpers/toolbarActions';
	import type { Clue } from '../helpers/types/types';

	export let clues: Clue[];
	export let ref: unknown;
	export let showAppKeyboard: boolean;
	export let isPuzzleComplete: boolean;
	export let keyboardStyle: 'outline' | 'depth';
	export let timeInSeconds: number;
	export let usedClear: boolean;
	export let usedReveal: boolean;
	export let usedCheck: boolean;
	export let onToggleKeyboard: () => void;
	export let onShowToast: () => void;
	export let toastOptions: object;
</script>

<Crossword
	bind:this={ref}
	data={clues}
	breakpoint={10000}
	theme="pink"
	showKeyboard={showAppKeyboard}
	revealed={isPuzzleComplete}
	{keyboardStyle}
>
	<div class="toolbar" slot="toolbar" let:onClear let:onReveal let:onCheck>
		<p id="timer">{getHumanReadableDuration(timeInSeconds)}</p>
		<button on:click={onToggleKeyboard} title="Toggle keyboard">
			{showAppKeyboard ? '⌨️' : '📱'}
		</button>
		<button
			class={usedClear ? 'active' : ''}
			on:click={() => {
				onToolbarClear(onClear);
				usedClear = true;
			}}>Clear</button
		>
		<button
			class={usedReveal ? 'active' : ''}
			on:click={() => {
				onToolbarReveal(onReveal);
				usedReveal = true;
			}}>Reveal</button
		>
		<button
			class={usedCheck ? 'active' : ''}
			on:click={() => {
				onToolbarCheck(onCheck);
				usedCheck = true;
			}}>Check</button
		>
		{#if isPuzzleComplete}
			{void onReveal()}
			<button class="next-puzzle-button" on:click={onShowToast}>Continue</button>
		{/if}
	</div>
</Crossword>
<SvelteToast options={toastOptions} />

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
	.active {
		color: aliceblue;
		background-color: var(--secondary-highlight-color);
	}
	#timer {
		display: inline;
	}
</style>
