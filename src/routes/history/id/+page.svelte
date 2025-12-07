<script lang="ts">
	import Crossword from '../../components/crossword/Crossword.svelte';
	import { onMount } from 'svelte';
	import { Amplify } from 'aws-amplify';
	import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
	import type { AuthUser } from 'aws-amplify/auth';
	import { goto } from '$app/navigation';
	import config from '../../../amplify_outputs.json';
	import { page } from '$app/stores';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { getHumanReadableDuration } from '../../helpers/getHumanReadableDuration';
	import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
	
	Amplify.configure(config);
	
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
			
			const session = await fetchAuthSession();
			const lambda = new LambdaClient({
				region: 'us-west-2',
				credentials: session.credentials
			});

			const functionName = (config.custom as { sqlQueriesFunctionName?: string })?.sqlQueriesFunctionName;
			if (!functionName) {
				throw new Error('SQL queries function name not found in config');
			}

			const userPuzzleCommand = new InvokeCommand({
				FunctionName: functionName,
				Payload: JSON.stringify({ query: 'getUserPuzzle', userPuzzleId })
			});

			const userPuzzleResponse = await lambda.send(userPuzzleCommand);
			const userPuzzlePayload = JSON.parse(new TextDecoder().decode(userPuzzleResponse.Payload));
			userPuzzle = JSON.parse(userPuzzlePayload.body);
			console.log({ userPuzzle });

			const puzzleCommand = new InvokeCommand({
				FunctionName: functionName,
				Payload: JSON.stringify({ query: 'getPuzzle', puzzleId: userPuzzle.puzzle_id })
			});

			const puzzleResponse = await lambda.send(puzzleCommand);
			const puzzlePayload = JSON.parse(new TextDecoder().decode(puzzleResponse.Payload));
			puzzle = JSON.parse(puzzlePayload.body);
			console.log({ puzzle });
			
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
