<!--
	Test-only stub for the heavy Crossword component. It avoids the real
	crossword engine (ResizeObserver, etc.) while still rendering the
	`toolbar` slot — which is where +page.svelte places the "Solved in ..."
	text and the used_* badges — so those assertions remain meaningful.
-->
<div data-testid="crossword-stub">
	<slot name="toolbar" onReveal={() => false} />
	<slot />
</div>
