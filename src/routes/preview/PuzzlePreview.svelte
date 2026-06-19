<script lang="ts">
	import { SyncLoader } from 'svelte-loading-spinners';
	import { goto } from '$app/navigation';
	import { getCurrentUser } from 'aws-amplify/auth';
	import { onMount } from 'svelte';
	import type { Clue } from '../helpers/types/types';
	import { previewClues } from './previewClues';
	import { vibrate } from '../helpers/haptics';
	import { puzzleStore } from '../helpers/puzzleStore';
	import { get } from 'svelte/store';
	import { createPuzzleTimer } from './helpers/puzzleTimer';
	import { toggleKeyboardSetting } from './helpers/toolbarActions';
	import { toastOptions, showPreviewToast } from './helpers/toastConfig';
	import PreviewCrossword from './PreviewCrossword.svelte';

	$: clues = [] as Clue[];
	$: timeInSeconds = 0;
	$: isPuzzleComplete = false;
	$: usedCheck = false;
	$: usedReveal = false;
	$: usedClear = false;
	$: keyboardStyle = 'outline' as 'outline' | 'depth';
	let showAppKeyboard = true;
	let ref: unknown;

	onMount(() => {
		showAppKeyboard = localStorage.getItem('showAppKeyboard') !== 'false';
		const store = get(puzzleStore);
		isPuzzleComplete = store.completedPreview;
		const setup = async () => {
			try {
				const currentUser = await getCurrentUser();
				if (currentUser.userId) goto('/');
			} catch {
				// Not logged in — render the preview puzzle.
			}
			clues = previewClues;
		};
		setup();
	});

	const onPuzzleComplete = () => {
		vibrate();
		const store = get(puzzleStore);
		puzzleStore.set({ ...store, completedPreview: true });
		isPuzzleComplete = true;
	};

	createPuzzleTimer({
		getRef: () => ref,
		isPuzzleComplete: () => isPuzzleComplete,
		onComplete: () => onPuzzleComplete(),
		onTick: () => {
			timeInSeconds++;
		}
	});

	const toggleKeyboard = () => {
		showAppKeyboard = toggleKeyboardSetting(showAppKeyboard);
	};
</script>

{#if clues.length === 0}
	<p><SyncLoader size="60" color="palevioletred" unit="px" duration="1s" /></p>
{:else}
	<h3>You're not signed in!</h3>
	<button id="signInButton" class="active" on:click={() => goto('/login')}>sign in/up</button>
	<PreviewCrossword
		{clues}
		bind:ref
		bind:showAppKeyboard
		bind:isPuzzleComplete
		{keyboardStyle}
		{timeInSeconds}
		bind:usedClear
		bind:usedReveal
		bind:usedCheck
		onToggleKeyboard={toggleKeyboard}
		onShowToast={showPreviewToast}
		{toastOptions}
	/>
{/if}

<style>
	#signInButton {
		background-color: palevioletred;
	}
	#signInButton:hover {
		background-color: mediumvioletred;
	}
	.active {
		color: aliceblue;
		background-color: var(--secondary-highlight-color);
	}
</style>
