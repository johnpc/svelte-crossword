<script>
	import CompletedMessage from './CompletedMessage.svelte';
	export let isComplete, isRevealing, showCompleteMessage, showConfetti;
	export let hasSlot = false;
</script>

{#if isComplete && !isRevealing && showCompleteMessage}
	<CompletedMessage {showConfetti}>
		{#if hasSlot}
			<slot />
		{:else}
			<h3>You solved it!</h3>
		{/if}
	</CompletedMessage>
{/if}

<style>
	h3 {
		margin: 0;
		margin-bottom: 0.5em;
	}
</style>
