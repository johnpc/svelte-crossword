<script lang="ts">
	import { Capacitor } from '@capacitor/core';
	import { tryOrAlert } from './loginLogic';
	import './login.css';

	export let username: string;
	export let password: string;
	export let confirmationCode: string;
	export let confirm: boolean;
	export let onLoginWithApple: () => Promise<void>;
	export let onLoginWithGoogle: () => Promise<void>;
	export let onRegister: () => Promise<void>;
	export let onConfirm: () => Promise<void>;
	export let onShowLogin: () => void;
</script>

<h1>Register</h1>
{#if !Capacitor.isNativePlatform()}
	<div style="text-align: center">
		<button on:click={onLoginWithApple} class="apple-sign-in"> Sign up with Apple</button>
		<br />
		<button on:click={onLoginWithGoogle} type="button" class="login-with-google-btn">
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
		<button type="submit" on:click={() => tryOrAlert(onRegister)}>Create account</button>
	{/if}
	{#if confirm}
		<hr />
		<label for="confirmation">Confirmation Code</label>
		<input required type="confirmation" id="confirmation" bind:value={confirmationCode} />
		<hr />
		<button type="submit" on:click={() => tryOrAlert(onConfirm)}>Confirm Email</button>
	{/if}
</form>
<p style="text-align: center;">
	Already registered? <a href="#registrationForm" aria-label="showLoginForm" on:click={onShowLogin}
		>Log In</a
	> instead
</p>
