<script lang="ts">
	import { Amplify } from 'aws-amplify';
	import config from '../../amplify_outputs.json';
	import SignUpForm from './SignUpForm.svelte';
	import SignInForm from './SignInForm.svelte';
	import ForgotPasswordForm from './ForgotPasswordForm.svelte';
	import { loginWithApple, loginWithGoogle } from './loginLogic';
	import { createLoginActions } from './loginPageActions';
	import { createAuthFlow } from './authFlow';

	Amplify.configure(config);

	// One owner for screen + step; the forms derive their booleans from it.
	const flow = createAuthFlow();
	let username = '';
	let password = '';
	let confirmationCode = '';

	const { onRegister, onConfirm, onLogin, onSendReset, onConfirmReset } = createLoginActions(
		() => ({ username, password, confirmationCode }),
		flow.send
	);
</script>

{#if $flow.screen === 'signUp'}
	<SignUpForm
		bind:username
		bind:password
		bind:confirmationCode
		confirm={$flow.step === 'confirmCode'}
		onLoginWithApple={loginWithApple}
		onLoginWithGoogle={loginWithGoogle}
		{onRegister}
		{onConfirm}
		onShowLogin={() => flow.send('showSignIn')}
	/>
{:else if $flow.screen === 'forgotPassword'}
	<ForgotPasswordForm
		bind:username
		bind:password
		bind:confirmationCode
		confirmForgotPassword={$flow.step === 'confirmCode'}
		{onSendReset}
		{onConfirmReset}
		onShowRegistration={() => flow.send('showSignUp')}
	/>
{:else}
	<SignInForm
		bind:username
		bind:password
		onLoginWithApple={loginWithApple}
		onLoginWithGoogle={loginWithGoogle}
		{onLogin}
		onShowForgotPassword={() => flow.send('showForgotPassword')}
		onShowRegistration={() => flow.send('showSignUp')}
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
