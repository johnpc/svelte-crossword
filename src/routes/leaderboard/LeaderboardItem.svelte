<script lang="ts">
	import { onMount } from 'svelte';
	import type { Schema } from '../../../amplify/data/resource';
	import { getCurrentUser } from 'aws-amplify/auth';
	export let profile: Schema['Profile'];

	$: completedPuzzles = [] as Schema['UserPuzzle'][];
	onMount(() => {
		const setup = async () => {
			let isLoggedIn = false;
			try {
				await getCurrentUser();
				isLoggedIn = true;
			} catch {
				isLoggedIn = false;
			}

			const completedPuzzlesResponse = await profile.completedPuzzles({
				authMode: isLoggedIn ? 'userPool' : 'iam'
			});
			completedPuzzles = completedPuzzlesResponse.data;
		};

		setup();
	});
</script>

<li>{profile.name}: ({completedPuzzles.length} completed)</li>
