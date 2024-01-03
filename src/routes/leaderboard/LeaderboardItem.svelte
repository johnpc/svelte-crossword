<script lang="ts">
	import { onMount } from 'svelte';
	import type { Schema } from '../../../amplify/data/resource';
	export let profile: Schema['Profile'];

	$: completedPuzzles = [] as Schema['UserPuzzle'][];
	onMount(() => {
		const setup = async () => {
			const completedPuzzlesResponse = await profile.completedPuzzles({
				authMode: 'iam'
			});
			completedPuzzles = completedPuzzlesResponse.data;
		};

		setup();
	});
</script>

<li>{profile.name}: ({completedPuzzles.length} completed)</li>
