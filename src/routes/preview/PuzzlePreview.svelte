<script lang="ts">
	import Crossword from '../components/crossword/Crossword.svelte';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { goto } from '$app/navigation';
	import { getCurrentUser } from 'aws-amplify/auth';
	import { onMount } from 'svelte';
	import type { Clue } from '../helpers/types/types';
	import { getHumanReadableDuration } from '../helpers/getHumanReadableDuration';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import { previewClues } from './previewClues';
	import { Haptics, ImpactStyle } from '@capacitor/haptics';

	$: clues = [] as Clue[];
	$: timeInSeconds = 0;
	$: isPuzzleComplete = false;
	$: usedCheck = false;
	$: usedReveal = false;
	$: usedClear = false;
	$: keyboardStyle = 'outline' as 'outline' | 'depth';
	let ref: any;
	const toastOptions = {
		theme: {
			'--toastBackground': 'palevioletred',
			'--toastColor': 'white',
			'--toastBarBackground': 'mediumVioletRed'
		}
	};

	onMount(() => {
		const setup = async () => {
			try {
				const currentUser = await getCurrentUser();
				if (currentUser.userId) {
					goto('/');
				}
			} catch (e) {
				console.log('Not logged in. Rendering preview.');
			}
			clues = previewClues;
			console.log({ onMount: true, clues });
		};

		setup();
	});

	const onPuzzleComplete = async () => {
		await Haptics.vibrate();
	};

	const tickTimer = () => {
		setTimeout(() => {
			if (ref) {
				const cells = ref?.$$?.ctx?.find(
					(element: any) => Array.isArray(element) && element?.[0]?.cells
				);
				if (!cells) {
					return tickTimer();
				}
				isPuzzleComplete = cells.every((cell: any) => cell.isCorrect);
				if (isPuzzleComplete) {
					return onPuzzleComplete();
				}
			}
			timeInSeconds++;
			if (!isPuzzleComplete) {
				tickTimer();
			}
		}, 1000);
	};
	tickTimer();

	const onToolbarClear = (onClear: Function) => {
		usedClear = true;
		onClear();
	};
	const onToolbarReveal = (onReveal: Function) => {
		usedReveal = true;
		onReveal();
	};
	const onToolbarCheck = (onCheck: Function) => {
		usedCheck = true;
		onCheck();
	};
	const onSignIn = () => {
		goto('/login');
	};
	const showToast = () => {
		toast.push(
			'Sign in/up to unlock unlimited crosswords! No limits, no ads, just fun puzzles to solve.'
		);
	};
</script>

{#if clues.length === 0}
	<p><SyncLoader size="60" color="palevioletred" unit="px" duration="1s" /></p>
{:else}
	<h3>👋 You're not signed in!</h3>
	<button id="signInButton" class="active" on:click={() => onSignIn()}>sign in/up </button>

	<Crossword
		bind:this={ref}
		data={clues}
		breakpoint={10000}
		theme="pink"
		showKeyboard={true}
		{keyboardStyle}
	>
		<div class="toolbar" slot="toolbar" let:onClear let:onReveal let:onCheck>
			<p id="timer">{getHumanReadableDuration(timeInSeconds)}</p>
			<button class={usedClear ? 'active' : ''} on:click={() => onToolbarClear(onClear)}
				>Clear</button
			>
			<button class={usedReveal ? 'active' : ''} on:click={() => onToolbarReveal(onReveal)}
				>Reveal</button
			>
			<button class={usedCheck ? 'active' : ''} on:click={() => onToolbarCheck(onCheck)}
				>Check</button
			>
			{#if isPuzzleComplete}
				<button class="next-puzzle-button" on:click={() => showToast()}>Continue</button>
			{/if}
		</div>
	</Crossword>
	<SvelteToast options={toastOptions} />
{/if}

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

	.next-puzzle-button {
		background-color: var(--secondary-highlight-color);
		color: aliceblue;
	}
	.history-button {
		background-color: var(--secondary-highlight-color);
		color: aliceblue;
	}
	#logoutLink {
		font-size: small;
	}
	#timer {
		display: inline;
	}
	.active {
		color: aliceblue;
		background-color: var(--secondary-highlight-color);
	}

	#signInButton {
		background-color: palevioletred;
	}

	#signInButton:hover {
		background-color: mediumvioletred;
	}
</style>
