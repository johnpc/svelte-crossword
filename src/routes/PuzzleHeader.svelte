<script lang="ts">
	export let email: string;
	export let puzzleTitle: string;
	export let puzzleAuthor: string;
	export let onSignOut: () => void;
</script>

<h3>
	👋 {email.split('@')[0]}
	<span id="logoutLink"
		>(not you? <button type="button" class="link-button" on:click={() => onSignOut()}
			>sign out</button
		>)</span
	>
</h3>
{#if puzzleTitle || puzzleAuthor}
	<div class="puzzle-info">
		{#if puzzleTitle}<span class="puzzle-title">{puzzleTitle}</span>{/if}
		{#if puzzleAuthor}<span class="puzzle-author">by {puzzleAuthor}</span>{/if}
	</div>
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
	#logoutLink {
		font-size: small;
	}
	.link-button {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		text-decoration: underline;
		cursor: pointer;
	}
</style>
