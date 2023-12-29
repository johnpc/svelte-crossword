<script lang="ts">
	import { goto } from '$app/navigation';
	import { signUp, signIn, confirmSignUp } from 'aws-amplify/auth';
	import { Amplify } from 'aws-amplify';
	import config from '../../amplifyconfiguration.json';
	Amplify.configure(config);

	$: register = false;
	$: confirm = false;
	$: username = '';
	$: password = '';
	$: confirmationCode = '';
	const registrationHandler = async () => {
		await signUp({
			username,
			password
		});
		confirm = true;
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
	<form id="registrationForm">
		<label for="email">Email&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
		<input required type="email" id="email" bind:value={username} />
		<hr />
		<label for="password">Password&nbsp;&nbsp;</label>
		<input required type="password" id="password" bind:value={password} />
		<hr />
		{#if !confirm}
			<button type="submit" on:click={registrationHandler}>Create account</button>
		{/if}
		{#if confirm}
			<label for="confirmation">Confirmation Code</label>
			<input required type="confirmation" id="confirmation" bind:value={confirmationCode} />
			<hr />
			<button type="submit" on:click={confirmationHandler}>Confirm Email</button>
		{/if}
	</form>
	<p>
		Already registered? <a
			href="#registrationForm"
			aria-label="showLoginForm"
			on:click={showLoginForm}>Log In</a
		> instead
	</p>{/if}

{#if !register}
	<h1>Log In</h1>
	<form id="loginForm">
		<label for="email">Email&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
		<input required type="email" id="email" bind:value={username} />
		<hr />

		<label for="password">Password&nbsp;&nbsp;</label>
		<input required type="password" id="password" bind:value={password} />
		<hr />
		<button type="submit" on:click={loginHandler}>Log in</button>
	</form>
	<p>
		Not registered? <a
			href="#loginForm"
			aria-label="showRegistrationForm"
			on:click={showRegistrationForm}>Create an Account</a
		> instead
	</p>{/if}
