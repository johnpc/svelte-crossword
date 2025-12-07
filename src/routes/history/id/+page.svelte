<script lang="ts">
	import Crossword from '../../components/crossword/Crossword.svelte';
	import { onMount } from 'svelte';
	import type { Schema } from '../../../../amplify/data/resource';
	import { generateClient } from 'aws-amplify/data';
	import { Amplify } from 'aws-amplify';
	import { getCurrentUser } from 'aws-amplify/auth';
	import type { AuthUser } from 'aws-amplify/auth';
	import { goto } from '$app/navigation';
	import config from '../../../amplify_outputs.json';
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

	$: userPuzzle = {} as { time_in_seconds: number; used_check: number; used_clear: number; used_reveal: number; puzzle_id: string };
	$: puzzle = {} as { puz_json: string };
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
			const userPuzzleResponse = await client.models.SqlUserPuzzle.get({
				id: userPuzzleId
			});
			console.log({ userPuzzleResponse });
			userPuzzle = userPuzzleResponse.data;
			const puzzleResponse = await client.models.SqlPuzzle.get({ id: userPuzzle.puzzle_id });
			console.log({ puzzleResponse });
			puzzle = puzzleResponse.data!;
			const jsonAtIndex = JSON.parse(puzzle.puz_json as string);
			const across = Object.values(jsonAtIndex.clues.across) as Clue[];
			const down = Object.values(jsonAtIndex.clues.down) as Clue[];
			clues = [...across, ...down];
			console.log({ clues });
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
				Solved in {getHumanReadableDuration(userPuzzle.time_in_seconds)} seconds.
			</p>
			{onReveal() ? '' : ''}
			{#if userPuzzle.used_clear}
				<span>Used Clear 🧹</span>
			{/if}
			{#if userPuzzle.used_reveal}
				<span>Used Reveal 🚨</span>
			{/if}
			{#if userPuzzle.used_check}
				<span>Used Check 🔎</span>
			{/if}
		</div>
	</Crossword>
	<p>Go back to <a href="#toolbar" on:click={() => goto('/history')}>history</a></p>
{/if}
