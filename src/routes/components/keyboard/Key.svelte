<script lang="ts">
	export let value: string;
	export let display: string;
	export let keyClass: string = '';
	export let active: boolean = false;
	export let onKeyStart: (event: Event, value: string) => void;
	export let onKeyEnd: (value: string) => void;
</script>

<button
	type="button"
	class="key key--{value} {keyClass}"
	class:single={value.length === 1}
	class:active
	on:touchstart={(e) => onKeyStart(e, value)}
	on:mousedown={(e) => onKeyStart(e, value)}
	on:touchend={() => onKeyEnd(value)}
	on:mouseup={() => onKeyEnd(value)}
>
	{#if display.includes('<svg')}{@html display}{:else}{display}{/if}
</button>

<style>
	button {
		appearance: none;
		display: inline-block;
		text-align: center;
		vertical-align: baseline;
		cursor: pointer;
		line-height: 1;
		transform-origin: 50% 50%;
		user-select: none;
		background: var(--background, #eee);
		color: var(--color, #111);
		border: var(--border, none);
		border-radius: var(--border-radius, 2px);
		box-shadow: var(--box-shadow, none);
		flex: var(--flex, 1);
		font-family: var(--font-family, sans-serif);
		font-size: var(--font-size, 20px);
		font-weight: var(--font-weight, normal);
		height: var(--height, 3.5rem);
		margin: var(--margin, 0.125rem);
		opacity: var(--opacity, 1);
		text-transform: var(--text-transform, none);
		-webkit-tap-highlight-color: transparent;
	}
	button.single {
		min-width: var(--min-width, 1rem);
	}
	button.active,
	button:active {
		background: var(--active-background, #ccc);
		border: var(--active-border, none);
		box-shadow: var(--active-box-shadow, none);
		color: var(--active-color, #111);
		opacity: var(--active-opacity, 1);
		transform: var(--active-transform, none);
	}
	button.key--Space {
		width: var(--space-width, 20%);
		flex: var(--space-flex, 3);
	}
	button.key--Page0,
	button.key--Page1,
	button.key--Shift,
	button.key--Backspace,
	button.key--Enter {
		flex: var(--special-flex, 1.5);
	}
</style>
