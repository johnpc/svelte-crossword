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
	import { fetchPuzzleById } from './fetchPuzzleById';
	import { loadHistoryDetail, type HistoryDetail } from './historyDetailLogic';
	import { loading, settle, type RemoteData } from '../../helpers/remoteData';

	Amplify.configure(config);

	// @state-machine history-detail-load — loading | ready(data) | failed(message)
	let detail: RemoteData<HistoryDetail> = loading();

	onMount(() => {
		(async () => {
			const settled = await settle(
				() =>
					loadHistoryDetail({
						getCurrentUser,
						fetchPuzzleById,
						getPuzzleId: () => $page.url.searchParams.get('id'),
						onUnauthenticated: () => goto('/login')
					}),
				'Could not load this puzzle. Please try again later.'
			);
			if (settled) detail = settled;
		})();
	});
</script>

{#if detail.status === 'loading'}
	<p style="margin: auto"><SyncLoader size="60" color="palevioletred" unit="px" duration="1s" /></p>
{:else if detail.status === 'failed'}
	<p role="alert">{detail.message}</p>
{:else}
	{@const userPuzzle = detail.data.userPuzzle}
	<Crossword
		data={detail.data.clues}
		breakpoint={10000}
		theme="pink"
		revealed={true}
		showConfetti={false}
		showCompleteMessage={false}
		showKeyboard={false}
	>
		<div id="toolbar" class="toolbar" slot="toolbar">
			<p style="display: inline;">
				Solved in {getHumanReadableDuration(userPuzzle.time_in_seconds)} seconds.
			</p>
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
