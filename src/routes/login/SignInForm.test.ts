import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

vi.mock('./loginLogic', () => ({
	tryOrAlert: (fn: () => unknown) => fn()
}));

const mockIsNative = vi.fn(() => false);
vi.mock('@capacitor/core', () => ({
	Capacitor: { isNativePlatform: () => mockIsNative() }
}));

import SignInForm from './SignInForm.svelte';

function baseProps(overrides = {}) {
	return {
		username: '',
		password: '',
		onLoginWithApple: vi.fn(),
		onLoginWithGoogle: vi.fn(),
		onLogin: vi.fn(),
		onShowForgotPassword: vi.fn(),
		onShowRegistration: vi.fn(),
		...overrides
	};
}

describe('SignInForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockIsNative.mockReturnValue(false);
	});

	it('renders the heading and email/password inputs', () => {
		const { getByText, getByRole, container } = render(SignInForm, { props: baseProps() });
		expect(getByText('Log In')).toBeTruthy();
		expect(getByRole('button', { name: 'Log in' })).toBeTruthy();
		expect(container.querySelector('#email')).toBeTruthy();
		expect(container.querySelector('#password')).toBeTruthy();
	});

	it('renders Apple/Google buttons when not on a native platform', () => {
		const { getByText, container } = render(SignInForm, { props: baseProps() });
		expect(getByText('Sign in with Apple')).toBeTruthy();
		expect(getByText('Sign In With Google')).toBeTruthy();
		expect(container.querySelector('#or-divider')).toBeTruthy();
	});

	it('hides Apple/Google buttons when on a native platform', () => {
		mockIsNative.mockReturnValue(true);
		const { queryByText, container } = render(SignInForm, { props: baseProps() });
		expect(queryByText('Sign in with Apple')).toBeNull();
		expect(queryByText('Sign In With Google')).toBeNull();
		expect(container.querySelector('#or-divider')).toBeNull();
	});

	it('calls onLoginWithApple when the Apple button is clicked', async () => {
		const props = baseProps();
		const { getByText } = render(SignInForm, { props });
		await fireEvent.click(getByText('Sign in with Apple'));
		expect(props.onLoginWithApple).toHaveBeenCalledTimes(1);
	});

	it('calls onLoginWithGoogle when the Google button is clicked', async () => {
		const props = baseProps();
		const { getByText } = render(SignInForm, { props });
		await fireEvent.click(getByText('Sign In With Google'));
		expect(props.onLoginWithGoogle).toHaveBeenCalledTimes(1);
	});

	it('calls onLogin (via tryOrAlert) when the Log in button is clicked', async () => {
		const props = baseProps();
		const { getByText } = render(SignInForm, { props });
		await fireEvent.click(getByText('Log in'));
		expect(props.onLogin).toHaveBeenCalledTimes(1);
	});

	it('calls onShowForgotPassword when the forgot link is clicked', async () => {
		const props = baseProps();
		const { getByText } = render(SignInForm, { props });
		await fireEvent.click(getByText('forgot?'));
		expect(props.onShowForgotPassword).toHaveBeenCalledTimes(1);
	});

	it('calls onShowRegistration when the registration link is clicked', async () => {
		const props = baseProps();
		const { getByLabelText } = render(SignInForm, { props });
		await fireEvent.click(getByLabelText('showRegistrationForm'));
		expect(props.onShowRegistration).toHaveBeenCalledTimes(1);
	});
});
