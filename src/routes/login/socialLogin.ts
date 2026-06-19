import { goto } from '$app/navigation';
import { signInWithRedirect } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';

export async function loginWithApple(): Promise<void> {
	const thing = Amplify.getConfig().Auth?.Cognito;
	console.log('redirecting...', { thing });
	await signInWithRedirect({ provider: 'Apple' });
	console.log({ appleLogin: true });
	goto('/');
}

export async function loginWithGoogle(): Promise<void> {
	const thing = Amplify.getConfig().Auth?.Cognito;
	console.log('redirecting...', { thing });
	await signInWithRedirect({ provider: 'Google' });
	console.log({ googleLogin: true });
	goto('/');
}
