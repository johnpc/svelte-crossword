import { get, writable, type Readable } from 'svelte/store';

/**
 * Where the visitor is in the sign-in/sign-up/reset journey. The sub-step
 * lives inside its screen, so "awaiting a confirmation code on the sign-in
 * screen" is unrepresentable (it used to be two stray booleans).
 */
export type AuthFlow =
	| { screen: 'signIn' }
	| { screen: 'signUp'; step: 'credentials' | 'confirmCode' }
	| { screen: 'forgotPassword'; step: 'request' | 'confirmCode' };

export type AuthFlowEvent =
	| 'showSignIn'
	| 'showSignUp'
	| 'showForgotPassword'
	/** The service emailed a code; the current screen moves to its code step. */
	| 'codeSent'
	/** The journey finished (confirmed sign-up, password reset); back to sign-in. */
	| 'completed';

export type AuthFlowDispatch = (event: AuthFlowEvent) => void;

export const INITIAL_AUTH_FLOW: AuthFlow = { screen: 'signIn' };

/** Pure, total transition function. Switching screens always restarts that screen. */
export function reduceAuthFlow(flow: AuthFlow, event: AuthFlowEvent): AuthFlow {
	switch (event) {
		case 'showSignIn':
		case 'completed':
			return INITIAL_AUTH_FLOW;
		case 'showSignUp':
			return { screen: 'signUp', step: 'credentials' };
		case 'showForgotPassword':
			return { screen: 'forgotPassword', step: 'request' };
		case 'codeSent':
			return flow.screen === 'signIn' ? flow : { ...flow, step: 'confirmCode' };
	}
}

export interface AuthFlowStore extends Readable<AuthFlow> {
	send: AuthFlowDispatch;
	current(): AuthFlow;
}

/** @state-machine auth-flow — the one writer of the login page's screen/step. */
export function createAuthFlow(initial: AuthFlow = INITIAL_AUTH_FLOW): AuthFlowStore {
	const store = writable(initial);
	return {
		subscribe: store.subscribe,
		send: (event) => store.update((flow) => reduceAuthFlow(flow, event)),
		current: () => get(store)
	};
}
