<script>
	import { popTransition as pop } from './helpers/cellLogic.js';

	export let value;
	export let number;
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
