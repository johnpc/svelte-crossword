<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		signUp,
		signIn,
		confirmSignUp,
		resetPassword,
		confirmResetPassword,
		signInWithRedirect,
		type ResetPasswordOutput
	} from 'aws-amplify/auth';

	import { Amplify } from 'aws-amplify';

	import config from '../../amplifyconfiguration.json';
	Amplify.configure(config);

	$: state = 'signIn' as 'signIn' | 'signUp' | 'forgotPassword';
	$: confirmForgotPassword = false;
	$: confirm = false;
	$: username = '';
	$: password = '';
	$: confirmationCode = '';

	function handleResetPasswordNextSteps(output: ResetPasswordOutput) {
		const { nextStep } = output;
		switch (nextStep.resetPasswordStep) {
			case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
				const codeDeliveryDetails = nextStep.codeDeliveryDetails;
				console.log(`Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`);
				confirmForgotPassword = true;
				// Collect the confirmation code from the user and pass to confirmResetPassword.
				break;
			case 'DONE':
				confirmForgotPassword = false;
				state = 'signIn';
				break;
		}
	}
	async function loginWithApple() {
		try {
			const thing = Amplify.getConfig().Auth?.Cognito;
			console.log('redirecting...', { thing });
			await signInWithRedirect({
				provider: 'Apple'
			});
			console.log({ appleLogin: true });
			goto('/');
		} catch (error) {
			console.log('error signing up:', error);
		}
	}

	async function handleForgotPassword(forgotPasswordArgs: {
		username: string;
		confirmationCode?: string;
		newPassword?: string;
	}) {
		if (!forgotPasswordArgs.username) {
			throw new Error('No email specified');
		}
		try {
			if (forgotPasswordArgs.confirmationCode! && forgotPasswordArgs.newPassword!) {
				await confirmResetPassword(
					forgotPasswordArgs as { username: string; confirmationCode: string; newPassword: string }
				);
				confirmForgotPassword = false;
				state = 'signIn';
			} else {
				const output = await resetPassword(forgotPasswordArgs);
				handleResetPasswordNextSteps(output);
			}
		} catch (error) {
			console.log(error);
		}
	}

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
		state = 'signIn';
		if (password) {
			return await loginHandler();
		}
		alert('Success. Now please log in');
	};

	const loginHandler = async () => {
		await signIn({
			username,
			password
		});
		goto('/');
	};

	const tryOrAlert = async (fn: Function, args: {}) => {
		try {
			await fn(args);
		} catch (error) {
			const message = `Error: ${(error as Error).message}`;
			console.error({ message, error });
			alert(message);
		}
	};

	const showForgotPasswordForm = () => {
		state = 'forgotPassword';
	};

	const showRegistrationForm = () => {
		state = 'signUp';
	};

	const showLoginForm = () => {
		state = 'signIn';
	};
</script>

{#if state === 'signUp'}
	<h1>Register</h1>
	<form id="registrationForm">
		<label for="email">Email&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
		<input required type="email" id="email" bind:value={username} />
		<br /><br />
		<label for="password">Password&nbsp;&nbsp;</label>
		<input required type="password" id="password" bind:value={password} />
		{#if !confirm}
			<hr />
			<button type="submit" on:click={() => tryOrAlert(registrationHandler, { username, password })}
				>Create account</button
			>
		{/if}
		{#if confirm}
			<label for="confirmation">Confirmation Code</label>
			<input required type="confirmation" id="confirmation" bind:value={confirmationCode} />
			<hr />
			<button
				type="submit"
				on:click={() => tryOrAlert(confirmationHandler, { username, confirmationCode })}
				>Confirm Email</button
			>
		{/if}
	</form>
	<p>
		Already registered? <a
			href="#registrationForm"
			aria-label="showLoginForm"
			on:click={showLoginForm}>Log In</a
		> instead
	</p>{/if}

{#if state === 'signIn'}
	<h1>Log In</h1>
	<div style="text-align: center">
		<button on:click={() => loginWithApple()} class="apple-sign-in">  Sign in with Apple </button>
	</div>
	<hr style="margin-inline: 0px;" />
	<p style="text-align: center;">or</p>
	<hr style="margin-inline: 0px;" />
	<form id="loginForm">
		<label for="email">Email&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
		<input required type="email" id="email" bind:value={username} />
		<br />
		<br />
		<label for="password">Password&nbsp;&nbsp;</label>
		<input required type="password" id="password" bind:value={password} />
		<a href="#" on:click={() => showForgotPasswordForm()}>forgot?</a>
		<hr />
		<button type="submit" on:click={() => tryOrAlert(loginHandler, { username, password })}
			>Log in</button
		>
	</form>
	<p>
		Not registered? <a
			href="#loginForm"
			aria-label="showRegistrationForm"
			on:click={showRegistrationForm}>Create an Account</a
		> instead
	</p>{/if}

{#if state === 'forgotPassword'}
	<h1>Reset Password</h1>
	<form id="forgotPasswordForm">
		<label for="email">Email&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
		<input required type="email" id="email" bind:value={username} />
		<hr />

		{#if !confirmForgotPassword}
			<button type="submit" on:click={() => tryOrAlert(handleForgotPassword, { username })}
				>Send Reset Email</button
			>
		{/if}
		{#if confirmForgotPassword}
			<p>A confirmation code was sent to your email.</p>
			<hr />
			<label for="confirmation">Confirmation Code</label>
			<input required type="confirmation" id="confirmation" bind:value={confirmationCode} />
			<hr />
			<label for="password">New Password&nbsp;&nbsp;</label>
			<input required type="password" id="password" bind:value={password} />
			<hr />
			<button
				type="submit"
				on:click={() =>
					tryOrAlert(handleForgotPassword, { username, confirmationCode, newPassword: password })}
				>Confirm Password Reset</button
			>
		{/if}
	</form>
	<p>
		Not registered? <a
			href="#loginForm"
			aria-label="showRegistrationForm"
			on:click={showRegistrationForm}>Create an Account</a
		> instead
	</p>{/if}

<style>
	.apple-sign-in {
		appearance: none;
		-webkit-appearance: none;
		padding: 5px 10px;
		margin: 10px;
		border: none;
		color: #fff;
		background: #000;
		font-size: 15px;
		max-width: 50%;
		cursor: pointer;
		border-radius: 7px;
	}
</style>
