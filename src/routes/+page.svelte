<script>
	import Puzzle from './Puzzle.svelte';
	import { Capacitor } from '@capacitor/core';
</script>

<svelte:head>
	<title>Small Crosswords</title>
	<meta name="description" content="Enjoy unlimited mini crossword puzzles!" />
</svelte:head>

<section>
	<h1>
		<span>Small Crosswords</span>
	</h1>

	<div>
		{#if !Capacitor.isNativePlatform()}
		<pwa-install>
			<div style="text-align: center;">
				<div style="margin-bottom: 15px;">works better as an app</div>
				<button class="installButton">Install App</button>
			</div>
		</pwa-install>
		{/if}
	</div>
	<Puzzle />
	<p>Enjoy unlimited mini crossword puzzles!</p>
</section>

<style>
	pwa-install::part(openButton) {
		background: none;
		color: black;
		border-radius: 5px;
	}

	.installButton {
		cursor: pointer;
		font-size: 1em;
		font-family: var(--font);

		background-color: palevioletred;
		color: white;
		border-radius: 4px;
		padding: 0.75em;
		border: none;
		font-weight: 400;
		transition: background-color 150ms;
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
