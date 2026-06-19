<script lang="ts">
	import Crossword from '../../components/crossword/Crossword.svelte';
	import { onMount } from 'svelte';
	import { Amplify } from 'aws-amplify';
	import { getCurrentUser } from 'aws-amplify/auth';
	import { goto } from '$app/navigation';
	import config from '../../../amplify_outputs.json';
	import { page } from '$app/stores';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { getHumanReadableDuration } from '../../helpers/getHumanReadableDuration';
	import { fetchPuzzleById, type UserPuzzleData } from './fetchPuzzleById';
	import { loadHistoryDetail } from './historyDetailLogic';
	import type { Clue } from '../../helpers/types/types';

	Amplify.configure(config);

	$: userPuzzle = {} as UserPuzzleData;
	$: clues = [] as Clue[];

	onMount(() => {
		(async () => {
			const detail = await loadHistoryDetail({
				getCurrentUser,
				fetchPuzzleById,
				getPuzzleId: () => $page.url.searchParams.get('id'),
				onUnauthenticated: () => goto('/login')
			});
			if (!detail) return;
			userPuzzle = detail.userPuzzle;
			clues = detail.clues;
		})();
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
