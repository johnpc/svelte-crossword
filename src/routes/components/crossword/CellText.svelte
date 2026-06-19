<script lang="ts">
	import { popTransition } from './helpers/cellLogic.js';
	import type { TransitionConfig } from 'svelte/transition';

	// The runtime helper ignores extra params; widen the param type so the
	// directive's `y` option (consumed for legacy compatibility) type-checks.
	const pop: (
		node: Element | null,
		params?: { y?: number; delay?: number; duration?: number }
	) => TransitionConfig = popTransition;

	export let value: string | undefined;
	export let number: number | undefined;
	export let changeDelay = 0;
	export let isRevealing = false;
</script>

{#if value}
	<text
		transition:pop={{ y: 5, delay: changeDelay, duration: isRevealing ? 250 : 0 }}
		class="value"
		x="0.5"
		y="0.9"
		text-anchor="middle"
	>
		{value}
	</text>
{/if}
<text class="number" x="0.08" y="0.3" text-anchor="start">{number}</text>

<style>
	text {
		pointer-events: none;
		line-height: 1;
		font-family: var(--font);
		fill: var(--main-color);
	}
	.value {
		font-size: 0.7em;
		font-weight: 400;
	}
	.number {
		font-size: 0.3em;
		font-weight: 400;
		fill: var(--main-color);
		opacity: 0.5;
	}
</style>
