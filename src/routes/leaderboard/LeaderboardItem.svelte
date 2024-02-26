<script lang="ts">
	import { onMount } from 'svelte';
	import type { Schema } from '../../../amplify/data/resource';
	import { Amplify } from 'aws-amplify';
	import config from '../../amplifyconfiguration.json';
	import { getAllUserPuzzles } from '../helpers/getAllUserPuzzles';
	import type { HydratedUserPuzzle } from '../helpers/types/types';
	import { getCurrentUser } from 'aws-amplify/auth';
	Amplify.configure(config);
	export let profile: Schema['Profile'];

	$: currentUserId = '';
	$: completedPuzzles = [] as HydratedUserPuzzle[];
	onMount(() => {
		const setup = async () => {
			const completedPuzzlesResponse = await getAllUserPuzzles(profile, true);
			completedPuzzles = completedPuzzlesResponse;
			try {
				const currentUser = await getCurrentUser();
				currentUserId = currentUser.userId;
			} catch {}
		};

		setup();
	});
</script>

<li class={currentUserId === profile.userId ? 'loggedInProfile' : ''}>
	{profile.name.split('@')[0]} ({completedPuzzles.length})
</li>

<style>
	.loggedInProfile {
		color: palevioletred;
	}
</style>
