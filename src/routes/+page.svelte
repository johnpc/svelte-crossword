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
	<Puzzle />
	<p>Enjoy unlimited mini crossword puzzles!</p>
	<div>
		{#if !Capacitor.isNativePlatform()}
			<div>
				<p style="text-align: center;">
					<a href="https://apps.apple.com/us/app/small-crosswords/id6475174988"
						> Install from App Store</a
					>
				</p>
				<p style="text-align: center;">
					<a href="https://play.google.com/store/apps/details?id=com.johncorser.crosswords"
						>🤖 Install from Google Play</a
					>
				</p>
			</div>
		{/if}
	</div>
</section>

<style>
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
</style>
