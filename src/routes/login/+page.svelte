<script lang="ts">
	import { Amplify } from 'aws-amplify';
	import config from '../../amplify_outputs.json';
	import SignUpForm from './SignUpForm.svelte';
	import SignInForm from './SignInForm.svelte';
	import ForgotPasswordForm from './ForgotPasswordForm.svelte';
	import {
		loginWithApple,
		loginWithGoogle,
		handleForgotPassword,
		registrationHandler,
		confirmationHandler,
		loginHandler,
		type AuthState,
		type StateCallbacks
	} from './loginLogic';

	Amplify.configure(config);

	$: state = 'signIn' as AuthState;
	$: confirmForgotPassword = false;
	$: confirm = false;
	$: username = '';
	$: password = '';
	$: confirmationCode = '';

	const callbacks: StateCallbacks = {
		setConfirmForgotPassword: (v) => (confirmForgotPassword = v),
		setState: (v) => (state = v),
		setConfirm: (v) => (confirm = v)
	};

	const onRegister = async () => {
		await registrationHandler(username, password);
		confirm = true;
		alert('Please check your email and enter confirmation code.');
	};
	const onConfirm = () => confirmationHandler(username, confirmationCode, password, callbacks);
	const onLogin = () => loginHandler(username, password);
	const onSendReset = () => handleForgotPassword({ username }, callbacks);
	const onConfirmReset = () =>
		handleForgotPassword({ username, confirmationCode, newPassword: password }, callbacks);
</script>

{#if state === 'signUp'}
	<SignUpForm
		bind:username
		bind:password
		bind:confirmationCode
		{confirm}
		onLoginWithApple={loginWithApple}
		onLoginWithGoogle={loginWithGoogle}
		{onRegister}
		{onConfirm}
		onShowLogin={() => (state = 'signIn')}
	/>
{/if}

{#if state === 'signIn'}
	<SignInForm
		bind:username
		bind:password
		onLoginWithApple={loginWithApple}
		onLoginWithGoogle={loginWithGoogle}
		{onLogin}
		onShowForgotPassword={() => (state = 'forgotPassword')}
		onShowRegistration={() => (state = 'signUp')}
	/>
{/if}

{#if state === 'forgotPassword'}
	<ForgotPasswordForm
		bind:username
		bind:password
		bind:confirmationCode
		{confirmForgotPassword}
		{onSendReset}
		{onConfirmReset}
		onShowRegistration={() => (state = 'signUp')}
	/>
{/if}

<style>
	:global(form),
	:global(#or-divider) {
		padding-left: 25%;
		padding-right: 25%;
	}
	@media screen and (max-width: 600px) {
		:global(form),
		:global(#or-divider) {
			padding-left: 0%;
			padding-right: 0%;
		}
	}
</style>
