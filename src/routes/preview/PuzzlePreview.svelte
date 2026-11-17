<script lang="ts">
	import { SyncLoader } from 'svelte-loading-spinners';
	import { goto } from '$app/navigation';
	import { getCurrentUser } from 'aws-amplify/auth';
	import { onDestroy, onMount } from 'svelte';
	import { readKeyboardSetting, toggleKeyboardSetting } from '../helpers/keyboardSetting';
	import { PREVIEW_PUZZLE, previewSession } from './previewSession';
	import { showPreviewToast } from './helpers/toastConfig';
	import PreviewCrossword from './PreviewCrossword.svelte';

	let showAppKeyboard = true;
	let gridSolved = false;

	const ticker = setInterval(() => previewSession.send({ type: 'tick' }), 1000);
	onDestroy(() => clearInterval(ticker));
	$: if (gridSolved) previewSession.send({ type: 'gridSolved' });

	onMount(() => {
		showAppKeyboard = readKeyboardSetting();
		// A solved preview stays solved across visits; anything else starts over.
		if (previewSession.current().phase !== 'solved') previewSession.send({ type: 'reset' });
		(async () => {
			try {
				const currentUser = await getCurrentUser();
				if (currentUser.userId) return void goto('/');
			} catch {
				// Not logged in — render the preview puzzle.
			}
			previewSession.send({ type: 'puzzleLoaded', puzzle: PREVIEW_PUZZLE });
		})();
	});

	const toggleKeyboard = () => (showAppKeyboard = toggleKeyboardSetting(showAppKeyboard));
</script>

{#if $previewSession.phase === 'playing' || $previewSession.phase === 'solved'}
	<h3>You're not signed in!</h3>
	<button id="signInButton" class="active" on:click={() => goto('/login')}>sign in/up</button>
	<PreviewCrossword
		session={$previewSession}
		{showAppKeyboard}
		keyboardStyle="outline"
		onAssist={(assist) => previewSession.send({ type: 'assistUsed', assist })}
		onToggleKeyboard={toggleKeyboard}
		onContinue={showPreviewToast}
		bind:isComplete={gridSolved}
	/>
{:else}
	<div style="margin: auto">
		<SyncLoader size="60" color="palevioletred" unit="px" duration="1s" />
	</div>
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
