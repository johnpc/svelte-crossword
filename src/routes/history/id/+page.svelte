<script lang="ts">
	import Crossword from '../../components/crossword/Crossword.svelte';
	import { onMount } from 'svelte';
	import { Amplify } from 'aws-amplify';
	import { getCurrentUser } from 'aws-amplify/auth';
	import type { AuthUser } from 'aws-amplify/auth';
	import { goto } from '$app/navigation';
	import config from '../../../amplify_outputs.json';
	import { page } from '$app/stores';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { getHumanReadableDuration } from '../../helpers/getHumanReadableDuration';
	import { fetchPuzzleById, type UserPuzzleData } from './fetchPuzzleById';
	import type { Clue } from '../../helpers/types/types';

	Amplify.configure(config);

	$: userPuzzle = {} as UserPuzzleData;
	$: currentUser = {} as AuthUser;
	$: clues = [] as Clue[];

	onMount(() => {
		const setup = async () => {
			try {
				currentUser = await getCurrentUser();
			} catch (e) {
				goto('/login');
			}
			const userPuzzleId = $page.url.searchParams.get('id')!;
			const result = await fetchPuzzleById(userPuzzleId);
			userPuzzle = result.userPuzzle;
			clues = result.clues;
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
