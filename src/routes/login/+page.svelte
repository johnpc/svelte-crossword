<script lang="ts">
	import { goto } from '$app/navigation';
	import { signUp, signIn, confirmSignUp } from 'aws-amplify/auth';
	import { Amplify } from 'aws-amplify';
	import config from '../../amplifyconfiguration.json';
	Amplify.configure(config);

	$: register = false;
	$: confirm = true;
	$: username = '';
	$: password = '';
	$: confirmationCode = '';
	const registrationHandler = async () => {
		await signUp({
			username,
			password
		});
		alert('Please check your email and enter confirmation code.');
	};

	const confirmationHandler = async () => {
		await confirmSignUp({
			username,
			confirmationCode
		});
		alert('Success. Now please log in');
		register = false;
	};

	const loginHandler = async () => {
		await signIn({
			username,
			password
		});
		goto('/');
	};

	const showRegistrationForm = () => {
		register = true;
	};
	const showLoginForm = () => {
		register = false;
	};
</script>

{#if register}
	<h1>Register</h1>
	<button on:click={showLoginForm}>Login</button>
	<form>
		<label for="email">Email</label>
		<input required type="email" id="email" bind:value={username} />

		<label for="password">Password</label>
		<input required type="password" id="password" bind:value={password} />
		{#if !confirm}
			<button type="submit" on:click={registrationHandler}>Create account</button>
		{/if}
		{#if confirm}
			<label for="confirmation">Confirmation Code</label>
			<input required type="confirmation" id="confirmation" bind:value={confirmationCode} />
			<button type="submit" on:click={confirmationHandler}>Confirm Email</button>
		{/if}
	</form>
{/if}

{#if !register}
	<h1>Log In</h1>
	<button on:click={showRegistrationForm}>Register</button>
	<form>
		<label for="email">Email</label>
		<input required type="email" id="email" bind:value={username} />

		<label for="password">Password</label>
		<input required type="password" id="password" bind:value={password} />

		<button type="submit" on:click={loginHandler}>Log in</button>
	</form>
{/if}
