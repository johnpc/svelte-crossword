<script lang="ts">
	import { Haptics, ImpactStyle } from '@capacitor/haptics';
	import Crossword from './components/crossword/Crossword.svelte';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { goto } from '$app/navigation';
	import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
	import { onMount } from 'svelte';
	import { signOut } from 'aws-amplify/auth';
	import { getOrCreateProfile } from './helpers/sql/getOrCreateProfile';
	import type { Clue, HydratedProfile } from './helpers/types/types';
	import { getNextPuzzle } from './helpers/sql/getNextPuzzle';
	import { puzzleStore, resetPuzzleStoreDefaults } from './helpers/puzzleStore';
	import { get } from 'svelte/store';
	import { getHumanReadableDuration } from './helpers/getHumanReadableDuration';
	import { haptic, vibrate } from './helpers/haptics';
	import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
	import { Amplify } from 'aws-amplify';
	import config from '../amplify_outputs.json';

	Amplify.configure(config);

	$: clues = [] as Clue[];
	$: puzzleId = '' as string;
	$: puzzleTitle = '' as string;
	$: puzzleAuthor = '' as string;
	$: profile = {} as HydratedProfile;
	$: timeInSeconds = 0;
	$: isPuzzleComplete = false;
	$: usedCheck = false;
	$: usedReveal = false;
	$: usedClear = false;
	$: keyboardStyle = 'outline' as 'outline' | 'depth';
	let showAppKeyboard = true;
	let ref: any;

	onMount(() => {
		showAppKeyboard = localStorage.getItem('showAppKeyboard') !== 'false';
		const setup = async () => {
			try {
				const currentUser = await getCurrentUser();
				const userAttributes = await fetchUserAttributes();
				console.log({ currentUser, userAttributes });
			} catch (e) {
				console.log(`Not logged in. goto /preview`, e);
				goto('/preview');
				return;
			}
			profile = await getOrCreateProfile();
			console.log({ onMount: true, profile });
			const puzzle = await getNextPuzzle(profile.id);
			clues = puzzle.clues;
			puzzleId = puzzle.id;
			puzzleTitle = puzzle.title || '';
			puzzleAuthor = puzzle.author || '';
			console.log({ onMount: true, clues, puzzleTitle, puzzleAuthor, puzzle });
		};

		setup();
	});

	const onPuzzleComplete = async () => {
		vibrate();

		const session = await fetchAuthSession();
		const lambda = new LambdaClient({
			region: 'us-west-2',
			credentials: session.credentials
		});

		const functionName = (config.custom as { sqlQueriesFunctionName?: string })
			?.sqlQueriesFunctionName;
		if (!functionName) {
			throw new Error('SQL queries function name not found in config');
		}

		const userPuzzleId = crypto.randomUUID();
		const command = new InvokeCommand({
			FunctionName: functionName,
			Payload: JSON.stringify({
				query: 'createUserPuzzle',
				userPuzzle: {
					id: userPuzzleId,
					profile_id: profile.id,
					puzzle_id: puzzleId,
					used_check: usedCheck ? 1 : 0,
					used_clear: usedClear ? 1 : 0,
					used_reveal: usedReveal ? 1 : 0,
					time_in_seconds: timeInSeconds
				}
			})
		});

		await lambda.send(command);
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
	const toggleKeyboard = () => {
		showAppKeyboard = !showAppKeyboard;
		localStorage.setItem('showAppKeyboard', String(showAppKeyboard));
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
		const puzzle = await getNextPuzzle(profile.id);
		clues = puzzle.clues;
		puzzleId = puzzle.id;
		puzzleTitle = puzzle.title || '';
		puzzleAuthor = puzzle.author || '';
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

	{#if puzzleTitle || puzzleAuthor}
		<div class="puzzle-info">
			{#if puzzleTitle}<span class="puzzle-title">{puzzleTitle}</span>{/if}
			{#if puzzleAuthor}<span class="puzzle-author">by {puzzleAuthor}</span>{/if}
		</div>
	{/if}

	<Crossword
		bind:this={ref}
		data={clues}
		breakpoint={10000}
		theme="pink"
		showKeyboard={showAppKeyboard}
		{keyboardStyle}
	>
		<div class="toolbar" slot="toolbar" let:onClear let:onReveal let:onCheck>
			<p id="timer">{getHumanReadableDuration(timeInSeconds)}</p>
			{#if !isPuzzleComplete}
				<button class="history-button" on:click={onToolbarHistory}>History</button>
			{/if}
			<button on:click={toggleKeyboard} title="Toggle keyboard">
				{showAppKeyboard ? '⌨️' : '📱'}
			</button>
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
	.puzzle-info {
		margin-bottom: 0.5em;
		display: flex;
		flex-direction: column;
		gap: 0.25em;
		font-family: var(--font);
	}

	.puzzle-title {
		font-weight: 600;
		font-size: 1.1em;
	}

	.puzzle-author {
		font-size: 0.9em;
		font-style: italic;
		color: #666;
	}

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
