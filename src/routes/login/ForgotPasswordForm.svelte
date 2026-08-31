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
<form
	id="forgotPasswordForm"
	on:submit|preventDefault={() => tryOrAlert(confirmForgotPassword ? onConfirmReset : onSendReset)}
>
	<label for="email">Email&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
	<input required type="email" id="email" autocomplete="email" bind:value={username} />
	<hr />

	{#if !confirmForgotPassword}
		<button type="submit">Send Reset Email</button>
	{/if}
	{#if confirmForgotPassword}
		<p>A confirmation code was sent to your email.</p>
		<hr />
		<label for="confirmation">Confirmation Code</label>
		<input required type="text" id="confirmation" bind:value={confirmationCode} />
		<hr />
		<label for="password">New Password&nbsp;&nbsp;</label>
		<input
			required
			type="password"
			id="password"
			autocomplete="new-password"
			bind:value={password}
		/>
		<hr />
		<button type="submit">Confirm Password Reset</button>
	{/if}
</form>
<p style="text-align: center;">
	Not registered? <a
		href="#loginForm"
		aria-label="showRegistrationForm"
		on:click={onShowRegistration}>Create an Account</a
	> instead
</p>
