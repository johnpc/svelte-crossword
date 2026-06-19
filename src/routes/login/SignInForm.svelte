<script lang="ts">
	import { Capacitor } from '@capacitor/core';
	import { tryOrAlert } from './loginLogic';
	import './login.css';

	export let username: string;
	export let password: string;
	export let onLoginWithApple: () => Promise<void>;
	export let onLoginWithGoogle: () => Promise<void>;
	export let onLogin: () => Promise<void>;
	export let onShowForgotPassword: () => void;
	export let onShowRegistration: () => void;
</script>

<h1>Log In</h1>
{#if !Capacitor.isNativePlatform()}
	<div style="text-align: center">
		<button on:click={onLoginWithApple} class="apple-sign-in"> Sign in with Apple</button>
		<br />
		<button on:click={onLoginWithGoogle} type="button" class="login-with-google-btn">
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
	<br /><br />
	<label for="password">Password&nbsp;&nbsp;</label>
	<input required type="password" id="password" bind:value={password} />
	<button type="button" class="link-button" on:click={onShowForgotPassword}>forgot?</button>
	<hr />
	<button type="submit" on:click={() => tryOrAlert(onLogin)}>Log in</button>
</form>
<p style="text-align: center;">
	Not registered? <a
		href="#loginForm"
		aria-label="showRegistrationForm"
		on:click={onShowRegistration}>Create an Account</a
	> instead
</p>
