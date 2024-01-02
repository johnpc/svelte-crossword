<script>
	import Puzzle from './Puzzle.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
</script>

<svelte:head>
	<title>Small Crosswords</title>
	<meta name="description" content="Enjoy unlimited mini crossword puzzles!" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset={welcome} type="image/webp" />
				<img src={welcome_fallback} alt="Welcome" />
			</picture>
		</span>

		<span>to Small Crosswords</span>
	</h1>
	<p>Enjoy unlimited mini crossword puzzles!</p>
	<pwa-install
		><div>Small Crosswords works better as an app.</div>
		<button class="installButton">Install App</button></pwa-install
	>
	<Puzzle />
</section>

<style>
	pwa-install::part(openButton) {
		background: none;
		color: black;
		border-radius: 5px;
	}

	.installButton {
		cursor: pointer;
		margin-left: 1em;
		font-size: 1em;
		font-family: var(--font);

		background-color: purple;
		color: white;
		border-radius: 4px;
		/* color: var(--main-color); */
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
