<script lang="ts">
	import logo from '$lib/images/logo.png';
	import github from '$lib/images/github.svg';
	import { onMount } from 'svelte';
	import HeaderNav from './HeaderNav.svelte';
	import { getStoredTheme, applyTheme, cycleTheme } from './helpers/themeManager';
	import type { Theme } from './helpers/themeManager';

	let theme: Theme = 'system';

	onMount(() => {
		theme = getStoredTheme();
		applyTheme(theme);
	});

	function toggleTheme() {
		theme = cycleTheme(theme);
		applyTheme(theme);
	}
</script>

<header>
	<div class="corner">
		<a href="/">
			<img src={logo} alt="Home" />
		</a>
	</div>

	<HeaderNav {theme} onToggleTheme={toggleTheme} />

	<div class="corner">
		<a href="https://github.com/johnpc/svelte-crossword">
			<img src={github} alt="GitHub" />
		</a>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}
	.corner {
		width: 3em;
		height: 3em;
	}
	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}
</style>
