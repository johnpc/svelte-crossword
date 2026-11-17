import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { createAuthFlow, INITIAL_AUTH_FLOW, reduceAuthFlow, type AuthFlow } from './authFlow';

const signUp: AuthFlow = { screen: 'signUp', step: 'credentials' };
const reset: AuthFlow = { screen: 'forgotPassword', step: 'request' };

describe('reduceAuthFlow', () => {
	it('starts on sign-in', () => {
		expect(INITIAL_AUTH_FLOW).toEqual({ screen: 'signIn' });
	});

	it('switching screens lands on their first step', () => {
		expect(reduceAuthFlow(INITIAL_AUTH_FLOW, 'showSignUp')).toEqual(signUp);
		expect(reduceAuthFlow(INITIAL_AUTH_FLOW, 'showForgotPassword')).toEqual(reset);
		expect(reduceAuthFlow(signUp, 'showSignIn')).toEqual(INITIAL_AUTH_FLOW);
	});

	it('a sent code advances the current screen to its code step', () => {
		expect(reduceAuthFlow(signUp, 'codeSent')).toEqual({ screen: 'signUp', step: 'confirmCode' });
		expect(reduceAuthFlow(reset, 'codeSent')).toEqual({
			screen: 'forgotPassword',
			step: 'confirmCode'
		});
	});

	it('a code cannot be awaited on the sign-in screen', () => {
		expect(reduceAuthFlow(INITIAL_AUTH_FLOW, 'codeSent')).toBe(INITIAL_AUTH_FLOW);
	});

	it('completing any journey returns to sign-in', () => {
		expect(reduceAuthFlow({ screen: 'signUp', step: 'confirmCode' }, 'completed')).toEqual(
			INITIAL_AUTH_FLOW
		);
		expect(reduceAuthFlow({ screen: 'forgotPassword', step: 'confirmCode' }, 'completed')).toEqual(
			INITIAL_AUTH_FLOW
		);
	});

	it('leaving a code step and coming back starts the screen over', () => {
		const awaiting = reduceAuthFlow(signUp, 'codeSent');
		expect(reduceAuthFlow(reduceAuthFlow(awaiting, 'showSignIn'), 'showSignUp')).toEqual(signUp);
	});
});

describe('createAuthFlow', () => {
	it('is a readable store driven only by send()', () => {
		const flow = createAuthFlow();
		expect(get(flow)).toEqual(INITIAL_AUTH_FLOW);
		flow.send('showForgotPassword');
		flow.send('codeSent');
		expect(flow.current()).toEqual({ screen: 'forgotPassword', step: 'confirmCode' });
		expect(get(flow)).toBe(flow.current());
	});
});
