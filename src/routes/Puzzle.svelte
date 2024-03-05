<script lang="ts">
	import { Haptics, ImpactStyle } from '@capacitor/haptics';
	import Crossword from './components/crossword/Crossword.svelte';
	import { SyncLoader } from 'svelte-loading-spinners';
	import type { Schema } from '../../amplify/data/resource';
	import { generateClient } from 'aws-amplify/data';
	import { goto } from '$app/navigation';
	import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
	import { onMount } from 'svelte';
	import { signOut } from 'aws-amplify/auth';
	import { getOrCreateProfile } from './helpers/getOrCreateProfile';
	import type { Clue, HydratedProfile, HydratedUserPuzzle } from './helpers/types/types';
	import { getNextPuzzle } from './helpers/getNextPuzzle';
	import { puzzleStore, resetPuzzleStoreDefaults } from './helpers/puzzleStore';
	import { get } from 'svelte/store';
	import { getHumanReadableDuration } from './helpers/getHumanReadableDuration';
	import { haptic, vibrate } from './helpers/haptics';

	const client = generateClient<Schema>({
		authMode: 'userPool'
	});

	$: clues = [] as Clue[];
	$: puzzleId = '' as string;
	$: profile = {} as HydratedProfile;
	$: timeInSeconds = 0;
	$: isPuzzleComplete = false;
	$: usedCheck = false;
	$: usedReveal = false;
	$: usedClear = false;
	$: keyboardStyle = 'outline' as 'outline' | 'depth';
	let ref: any;

	onMount(() => {
		const setup = async () => {
			try {
				const currentUser = await getCurrentUser();
				const userAttributes = await fetchUserAttributes();
				console.log({ currentUser, userAttributes });
			} catch (e) {
				console.log(`Not logged in. goto /preview`, e);
				goto('/preview');
			}
			profile = await getOrCreateProfile(client);
			console.log({ onMount: true, profile });
			const puzzle = await getNextPuzzle(profile);
			clues = puzzle.clues;
			puzzleId = puzzle.id;
			console.log({ onMount: true, clues });
		};

		setup();
	});

	const onPuzzleComplete = async () => {
		vibrate();
		const userPuzzleResponse = await client.models.UserPuzzle.create({
			usedCheck,
			usedClear,
			usedReveal,
			timeInSeconds,
			userPuzzlePuzzleId: puzzleId,
			profileCompletedPuzzlesId: profile.id
		});

		const store = get(puzzleStore);
		const cachedUserPuzzles = store.userPuzzles[profile.id];
		try {
			puzzleStore.set({
				...store,
				userPuzzles: {
					[profile.id]: [
						...cachedUserPuzzles,
						{
							id: userPuzzleResponse.data.id,
							profileCompletedPuzzlesId: userPuzzleResponse.data.profileCompletedPuzzlesId,
							timeInSeconds: userPuzzleResponse.data.timeInSeconds,
							usedCheck: userPuzzleResponse.data.usedCheck,
							usedClear: userPuzzleResponse.data.usedClear,
							usedReveal: userPuzzleResponse.data.usedReveal,
							userPuzzlePuzzleId: userPuzzleResponse.data.userPuzzlePuzzleId,
							createdAt: userPuzzleResponse.data.createdAt
						} as HydratedUserPuzzle
					]
				}
			});
		} catch (e) {
			console.error('Failed to write to local storage', e);
		}
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
		haptic();
		usedClear = true;
		onClear();
	};
	const onToolbarReveal = (onReveal: Function) => {
		haptic();
		usedReveal = true;
		onReveal();
	};
	const onToolbarCheck = (onCheck: Function) => {
		haptic();
		usedCheck = true;
		onCheck();
	};
	const onToolbarHistory = () => {
		goto('/history');
	};
	const onToolbarNextPuzzle = async () => {
		haptic();
		console.log('Requested new puzzle!');
		timeInSeconds = 0;
		usedCheck = false;
		usedReveal = false;
		usedClear = false;
		isPuzzleComplete = false;
		const puzzle = await getNextPuzzle(profile);
		clues = puzzle.clues;
		puzzleId = puzzle.id;
		tickTimer();
	};

	const sleep = (milliseconds: number) => {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	};

	const onSignOut = async () => {
		haptic();
		await signOut();
		clues = [];
		await sleep(500);
		goto('/login');
	};
</script>

{#if clues.length === 0}
	<p><SyncLoader size="60" color="palevioletred" unit="px" duration="1s" /></p>
{:else}
	<h3>
		👋 {profile.email.split('@')[0]}
		<span id="logoutLink">(not you? <a href="#" on:click={() => onSignOut()}>sign out</a>)</span>
	</h3>

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
			{#if !isPuzzleComplete}
				<button class="history-button" on:click={onToolbarHistory}>History</button>
			{/if}
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
				<button class="next-puzzle-button" on:click={() => onToolbarNextPuzzle()}>Continue</button>
			{/if}
		</div>
	</Crossword>
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
</style>
