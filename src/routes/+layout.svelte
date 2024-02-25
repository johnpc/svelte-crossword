<script>
	import Header from './Header.svelte';
	import { resetPuzzleStoreDefaults } from './helpers/puzzleStore';
	import './styles.css';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	const toastOptions = {
		theme: {
			'--toastBackground': 'palevioletred',
			'--toastColor': 'white',
			'--toastBarBackground': 'mediumVioletRed'
		}
	};

	const clearCache = () => {
		resetPuzzleStoreDefaults();
		toast.push('Cache cleared.');
	};
</script>

<div class="app">
	<Header />

	<main>
		<slot />
	</main>

	<footer>
		<SvelteToast options={toastOptions} />
		<p>Problem? <a href="#" on:click={() => clearCache()}>clear cache</a></p>

		<p>
			Made with 🩷 in Ann Arbor, MI 🌳 <br />
			Contact <a href="mailto:support@smallcrosswords.com">support@smallcrosswords.com</a> for support.
		</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	footer p {
		text-align: center;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
