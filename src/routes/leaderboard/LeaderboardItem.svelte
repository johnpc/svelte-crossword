<script lang="ts">
	import { onMount } from 'svelte';
	import type { Schema } from '../../../amplify/data/resource';
	import { Amplify } from 'aws-amplify';
	import config from '../../amplifyconfiguration.json';
	import { getAllUserPuzzles } from '../helpers/getAllUserPuzzles';
	import type { HydratedUserPuzzle } from '../helpers/types/types';
	Amplify.configure(config);
	export let profile: Schema['Profile'];

	$: completedPuzzles = [] as HydratedUserPuzzle[];
	onMount(() => {
		const setup = async () => {
			const completedPuzzlesResponse = await getAllUserPuzzles(profile, true);
			completedPuzzles = completedPuzzlesResponse;
		};

		setup();
	});
</script>

<li>{profile.name.split('@')[0]} ({completedPuzzles.length})</li>
