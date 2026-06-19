<script>
	import CompletedMessage from './CompletedMessage.svelte';
	export let isComplete, isRevealing, showCompleteMessage, showConfetti;
</script>

{#if isComplete && !isRevealing && showCompleteMessage}
	<CompletedMessage {showConfetti}>
		<slot><h3>You solved it!</h3></slot>
	</CompletedMessage>
{/if}

<style>
	h3 {
		margin: 0;
		margin-bottom: 0.5em;
	}
</style>
