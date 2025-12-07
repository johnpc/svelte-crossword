<script lang="ts">
	import { onMount } from 'svelte';
	import { Amplify } from 'aws-amplify';
	import config from '../../amplify_outputs.json';
	import { getCurrentUser } from 'aws-amplify/auth';
	import type { LeaderboardEntry } from '../helpers/sql/getLeaderboard';

	Amplify.configure(config);
	export let profile: LeaderboardEntry;

	$: currentUserId = '';
	onMount(async () => {
		try {
			const currentUser = await getCurrentUser();
			currentUserId = currentUser.userId;
		} catch {}
	});
</script>

<li class={currentUserId === profile.id ? 'loggedInProfile' : ''}>
	{profile.name.split('@')[0]} ({profile.completedCount})
</li>

<style>
	.loggedInProfile {
		color: palevioletred;
	}
</style>
