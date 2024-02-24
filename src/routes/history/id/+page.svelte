<script lang="ts">
	import Crossword from '../../components/crossword/Crossword.svelte';
	import { onMount } from 'svelte';
	import type { Schema } from '../../../../amplify/data/resource';
	import { generateClient } from 'aws-amplify/data';
	import { Amplify } from 'aws-amplify';
	import { getCurrentUser } from 'aws-amplify/auth';
	import type { AuthUser } from 'aws-amplify/auth';
	import { goto } from '$app/navigation';
	import config from '../../../amplifyconfiguration.json';
	import { page } from '$app/stores';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { getHumanReadableDuration } from '../../helpers/getHumanReadableDuration';
	Amplify.configure(config);
	const client = generateClient<Schema>({
		authMode: 'userPool'
	});
	type Clue = {
		clue: string;
		answer: string;
		direction: 'across' | 'down';
		x: number;
		y: number;
	};

	$: userPuzzle = {} as Schema['UserPuzzle'];
	$: puzzle = {} as Schema['Puzzle'];
	$: currentUser = {} as AuthUser;
	$: clues = [] as Clue[];
	onMount(() => {
		const setup = async () => {
			try {
				currentUser = await getCurrentUser();
			} catch (e) {
				goto('/login');
			}
			console.log({ currentUser });
			const userPuzzleId = $page.url.searchParams.get('id')!;
			console.log({ userPuzzleId: userPuzzleId });
			const userPuzzleResponse = await client.models.UserPuzzle.get({
				id: userPuzzleId
			});
			console.log({ userPuzzleResponse });
			userPuzzle = userPuzzleResponse.data;
			const puzzleResponse = await userPuzzle.puzzle();
			console.log({ puzzleResponse });
			puzzle = puzzleResponse.data!;
			const jsonAtIndex = JSON.parse(puzzle.puzJson as string);
			const across = Object.values(jsonAtIndex.clues.across) as Clue[];
			const down = Object.values(jsonAtIndex.clues.down) as Clue[];
			clues = [...across, ...down];
		};

		setup();
	});
</script>

{#if clues.length === 0}
	<p style="margin: auto"><SyncLoader size="60" color="palevioletred" unit="px" duration="1s" /></p>
{:else}
	<Crossword
		data={clues}
		breakpoint={10000}
		theme="pink"
		revealed={true}
		showConfetti={false}
		showCompleteMessage={false}
		showKeyboard={false}
	>
		<div id="toolbar" class="toolbar" slot="toolbar" let:onReveal>
			<p style="display: inline;">
				Solved in {getHumanReadableDuration(userPuzzle.timeInSeconds)} seconds.
			</p>
			{onReveal() ? '' : ''}
			{#if userPuzzle.usedClear}
				<span>Used Clear 🧹</span>
			{/if}
			{#if userPuzzle.usedReveal}
				<span>Used Reveal 🚨</span>
			{/if}
			{#if userPuzzle.usedCheck}
				<span>Used Check 🔎</span>
			{/if}
		</div>
	</Crossword>
	<p>Go back to <a href="#toolbar" on:click={() => goto('/history')}>history</a></p>
{/if}
