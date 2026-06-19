<script lang="ts">
	import { tryOrAlert } from './loginLogic';

	export let username: string;
	export let password: string;
	export let confirmationCode: string;
	export let confirmForgotPassword: boolean;
	export let onSendReset: () => Promise<void>;
	export let onConfirmReset: () => Promise<void>;
	export let onShowRegistration: () => void;
</script>

<h1>Reset Password</h1>
<form id="forgotPasswordForm">
	<label for="email">Email&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
	<input required type="email" id="email" bind:value={username} />
	<hr />

	{#if !confirmForgotPassword}
		<button type="submit" on:click={() => tryOrAlert(onSendReset)}>Send Reset Email</button>
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
		<button type="submit" on:click={() => tryOrAlert(onConfirmReset)}>Confirm Password Reset</button
		>
	{/if}
</form>
<p style="text-align: center;">
	Not registered? <a
		href="#loginForm"
		aria-label="showRegistrationForm"
		on:click={onShowRegistration}>Create an Account</a
	> instead
</p>
