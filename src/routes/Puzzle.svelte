<script lang="ts">
	import PuzzleCrossword from './PuzzleCrossword.svelte';
	import PuzzleHeader from './PuzzleHeader.svelte';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { goto } from '$app/navigation';
	import { getCurrentUser, signOut } from 'aws-amplify/auth';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import { getOrCreateProfile } from './helpers/sql/getOrCreateProfile';
	import { readKeyboardSetting, toggleKeyboardSetting } from './helpers/keyboardSetting';
	import { createPuzzleSession } from './helpers/session/puzzleSessionStore';
	import type { HydratedProfile } from './helpers/types/types';
	import {
		performSignOut,
		loadNextPuzzle,
		initializePuzzle,
		submitPuzzleCompletion
	} from './helpers/puzzleGameLogic';

	let profile: HydratedProfile = { id: '', email: '' };
	let showAppKeyboard = true;
	let gridSolved = false;

	// @state-machine puzzle-session — the store is the one writer; this
	// component only sends events and renders `$session`.
	const session = createPuzzleSession((solved) => submitPuzzleCompletion(profile.id, solved));
	const ticker = setInterval(() => session.send({ type: 'tick' }), 1000);
	onDestroy(() => clearInterval(ticker));
	$: if (gridSolved) session.send({ type: 'gridSolved' });

	const fail = (message: string, e: unknown) => {
		console.error(message, e);
		toast.push(message);
		session.send({ type: 'loadFailed', message });
	};

	const loadAnother = async () => {
		// The grid is unmounted while loading, so the next one starts unsolved.
		gridSolved = false;
		try {
			session.send({ type: 'puzzleLoaded', puzzle: await loadNextPuzzle(profile.id) });
		} catch (e) {
			fail('Error loading the next puzzle. Please try again.', e);
		}
	};

	onMount(() => {
		showAppKeyboard = readKeyboardSetting();
		initializePuzzle(getCurrentUser, getOrCreateProfile, {
			onAuthenticated(p, puzzle) {
				profile = p;
				session.send({ type: 'puzzleLoaded', puzzle });
			},
			onUnauthenticated: () => goto('/preview'),
			onError: (e) => fail('Error loading puzzle. Please try refreshing the page.', e)
		});
	});

	const toggleKeyboard = () => (showAppKeyboard = toggleKeyboardSetting(showAppKeyboard));
	const onNextPuzzle = () => {
		if (session.send({ type: 'nextRequested' }).phase === 'loading') loadAnother();
	};
	const onRetry = () => {
		session.send({ type: 'reset' });
		loadAnother();
	};
	const onSignOut = () => performSignOut(signOut, () => session.send({ type: 'reset' }));
</script>

{#if $session.phase === 'exhausted'}
	<PuzzleHeader email={profile.email} puzzleTitle="" puzzleAuthor="" {onSignOut} />
	<p class="notice">
		You've completed every available puzzle! 🎉<br />
		Check back soon for more.
	</p>
{:else if $session.phase === 'error'}
	<p class="notice" role="alert">
		{$session.message}<br />
		<button type="button" class="retry" on:click={onRetry}>Try again</button>
	</p>
{:else if $session.phase === 'loading'}
	<div style="margin: auto">
		<SyncLoader size="60" color="palevioletred" unit="px" duration="1s" />
	</div>
{:else}
	<PuzzleHeader
		email={profile.email}
		puzzleTitle={$session.puzzle.title || ''}
		puzzleAuthor={$session.puzzle.author || ''}
		{onSignOut}
	/>
	<PuzzleCrossword
		session={$session}
		{showAppKeyboard}
		keyboardStyle="outline"
		onAssist={(assist) => session.send({ type: 'assistUsed', assist })}
		onToggleKeyboard={toggleKeyboard}
		onContinue={onNextPuzzle}
		bind:isComplete={gridSolved}
	/>
{/if}

<style>
	.notice {
		text-align: center;
		padding: 2rem;
	}
	.retry {
		margin-top: 1em;
		cursor: pointer;
		font: inherit;
		padding: 0.5em 1em;
		border: none;
		border-radius: 4px;
		background-color: palevioletred;
		color: white;
	}
</style>
