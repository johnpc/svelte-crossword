import { goto } from '$app/navigation';
import { signUp, signIn, confirmSignUp } from 'aws-amplify/auth';
import type { StateCallbacks } from './types';

export type { AuthState, StateCallbacks } from './types';
export { loginWithApple, loginWithGoogle } from './socialLogin';
export { handleForgotPassword, handleResetPasswordNextSteps } from './passwordReset';

export async function registrationHandler(username: string, password: string): Promise<void> {
	await signUp({ username, password });
}

export async function confirmationHandler(
	username: string,
	confirmationCode: string,
	password: string,
	callbacks: StateCallbacks
): Promise<void> {
	await confirmSignUp({ username, confirmationCode });
	callbacks.setState('signIn');
	if (password) {
		await loginHandler(username, password);
		return;
	}
	alert('Success. Now please log in');
}

export async function loginHandler(username: string, password: string): Promise<void> {
	await signIn({ username, password });
	goto('/');
}

export async function tryOrAlert(fn: () => Promise<void>): Promise<void> {
	try {
		await fn();
	} catch (error) {
		const message = `Error: ${(error as Error).message}`;
		console.error({ message, error });
		alert(message);
	}
}
