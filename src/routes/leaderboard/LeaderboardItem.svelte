<script lang="ts">
	import { onMount } from 'svelte';
	import type { Schema } from '../../../amplify/data/resource';
	import { generateClient } from 'aws-amplify/data';
	import { Amplify } from 'aws-amplify';
	import config from '../../amplifyconfiguration.json';
	import { getAllUserPuzzles } from '../helpers/getAllUserPuzzles';
	Amplify.configure(config);
	const client = generateClient<Schema>({
		authMode: 'iam'
	});
	export let profile: Schema['Profile'];

	$: completedPuzzles = [] as Schema['UserPuzzle'][];
	onMount(() => {
		const setup = async () => {
			const completedPuzzlesResponse = await getAllUserPuzzles(profile);
			completedPuzzles = completedPuzzlesResponse;
		};

		setup();
	});
</script>

<li>{profile.name}: ({completedPuzzles.length} completed)</li>
