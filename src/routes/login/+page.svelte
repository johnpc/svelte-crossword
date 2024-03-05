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
	import { Capacitor } from '@capacitor/core';

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

	async function loginWithGoogle() {
		try {
			const thing = Amplify.getConfig().Auth?.Cognito;
			console.log('redirecting...', { thing });
			await signInWithRedirect({
				provider: 'Google'
			});
			console.log({ googleLogin: true });
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
	{#if !Capacitor.isNativePlatform()}
		<div style="text-align: center">
			<button on:click={() => loginWithApple()} class="apple-sign-in">
				 Sign up with Apple
			</button>
			<br />
			<button on:click={() => loginWithGoogle()} type="button" class="login-with-google-btn">
				Sign Up With Google
			</button>
		</div>
		<div id="or-divider">
			<hr style="margin-inline: 0px;" />
			<p style="text-align: center;">or</p>
			<hr style="margin-inline: 0px;" />
		</div>
	{/if}
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
			<hr />
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
	<p style="text-align: center;">
		Already registered? <a
			href="#registrationForm"
			aria-label="showLoginForm"
			on:click={showLoginForm}>Log In</a
		> instead
	</p>{/if}

{#if state === 'signIn'}
	<h1>Log In</h1>
	{#if !Capacitor.isNativePlatform()}
		<div style="text-align: center">
			<button on:click={() => loginWithApple()} class="apple-sign-in">
				 Sign in with Apple
			</button>
			<br />
			<button on:click={() => loginWithGoogle()} type="button" class="login-with-google-btn">
				Sign In With Google
			</button>
		</div>
		<div id="or-divider">
			<hr style="margin-inline: 0px;" />
			<p style="text-align: center;">or</p>
			<hr style="margin-inline: 0px;" />
		</div>
	{/if}
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
	<p style="text-align: center;">
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
	<p style="text-align: center;">
		Not registered? <a
			href="#loginForm"
			aria-label="showRegistrationForm"
			on:click={showRegistrationForm}>Create an Account</a
		> instead
	</p>{/if}

<style>
	form,
	#or-divider {
		padding-left: 25%;
		padding-right: 25%;
	}
	@media screen and (max-width: 600px) {
		form,
		#or-divider {
			padding-left: 0%;
			padding-right: 0%;
		}
	}

	.apple-sign-in {
		appearance: none;
		-webkit-appearance: none;
		padding: 12px 16px 12px 20px;
		margin: 10px;
		border: none;
		color: #fff;
		background: #000;
		font-size: 14px;
		width: 60%;
		cursor: pointer;
		border-radius: 7px;
	}
	.login-with-google-btn {
		cursor: pointer;
		appearance: none;
		-webkit-appearance: none;
		width: 60%;
		margin: 10px;

		transition:
			background-color 0.3s,
			box-shadow 0.3s;

		padding: 12px 16px 12px 42px;
		border: none;
		border-radius: 7px;
		box-shadow:
			0 -1px 0 rgba(0, 0, 0, 0.04),
			0 1px 1px rgba(0, 0, 0, 0.25);

		color: #757575;
		font-size: 14px;
		font-weight: 500;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;

		background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=);
		background-color: white;
		background-repeat: no-repeat;
		background-position: 12px 11px;

		&:hover {
			box-shadow:
				0 -1px 0 rgba(0, 0, 0, 0.04),
				0 2px 4px rgba(0, 0, 0, 0.25);
		}

		&:active {
			background-color: #eeeeee;
		}

		&:focus {
			outline: none;
			box-shadow:
				0 -1px 0 rgba(0, 0, 0, 0.04),
				0 2px 4px rgba(0, 0, 0, 0.25),
				0 0 0 3px #c8dafc;
		}

		&:disabled {
			filter: grayscale(100%);
			background-color: #ebebeb;
			box-shadow:
				0 -1px 0 rgba(0, 0, 0, 0.04),
				0 1px 1px rgba(0, 0, 0, 0.25);
			cursor: not-allowed;
		}
	}
</style>
