import { goto } from '$app/navigation';
import { signInWithRedirect } from 'aws-amplify/auth';

export async function loginWithApple(): Promise<void> {
	await signInWithRedirect({ provider: 'Apple' });
	goto('/');
}

export async function loginWithGoogle(): Promise<void> {
	await signInWithRedirect({ provider: 'Google' });
	goto('/');
}
