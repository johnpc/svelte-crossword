import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

vi.mock('./loginLogic', () => ({
	tryOrAlert: (fn: () => unknown) => fn()
}));

const mockIsNative = vi.fn(() => false);
vi.mock('@capacitor/core', () => ({
	Capacitor: { isNativePlatform: () => mockIsNative() }
}));

import SignUpForm from './SignUpForm.svelte';

function baseProps(overrides = {}) {
	return {
		username: '',
		password: '',
		confirmationCode: '',
		confirm: false,
		onLoginWithApple: vi.fn(),
		onLoginWithGoogle: vi.fn(),
		onRegister: vi.fn(),
		onConfirm: vi.fn(),
		onShowLogin: vi.fn(),
		...overrides
	};
}

describe('SignUpForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockIsNative.mockReturnValue(false);
	});

	it('renders the heading and email/password inputs', () => {
		const { getByText, container } = render(SignUpForm, { props: baseProps() });
		expect(getByText('Register')).toBeTruthy();
		expect(container.querySelector('#email')).toBeTruthy();
		expect(container.querySelector('#password')).toBeTruthy();
	});

	it('renders Apple/Google buttons when not on a native platform', () => {
		const { getByText, container } = render(SignUpForm, { props: baseProps() });
		expect(getByText('Sign up with Apple')).toBeTruthy();
		expect(getByText('Sign Up With Google')).toBeTruthy();
		expect(container.querySelector('#or-divider')).toBeTruthy();
	});

	it('hides Apple/Google buttons when on a native platform', () => {
		mockIsNative.mockReturnValue(true);
		const { queryByText, container } = render(SignUpForm, { props: baseProps() });
		expect(queryByText('Sign up with Apple')).toBeNull();
		expect(queryByText('Sign Up With Google')).toBeNull();
		expect(container.querySelector('#or-divider')).toBeNull();
	});

	it('shows the Create account button and no confirmation UI when confirm is false', () => {
		const { getByText, queryByText, container } = render(SignUpForm, {
			props: baseProps({ confirm: false })
		});
		expect(getByText('Create account')).toBeTruthy();
		expect(queryByText('Confirm Email')).toBeNull();
		expect(container.querySelector('#confirmation')).toBeNull();
	});

	it('shows the confirmation UI and no Create account button when confirm is true', () => {
		const { getByText, queryByText, container } = render(SignUpForm, {
			props: baseProps({ confirm: true })
		});
		expect(getByText('Confirm Email')).toBeTruthy();
		expect(getByText('Confirmation Code')).toBeTruthy();
		expect(queryByText('Create account')).toBeNull();
		expect(container.querySelector('#confirmation')).toBeTruthy();
	});

	it('calls onLoginWithApple when the Apple button is clicked', async () => {
		const props = baseProps();
		const { getByText } = render(SignUpForm, { props });
		await fireEvent.click(getByText('Sign up with Apple'));
		expect(props.onLoginWithApple).toHaveBeenCalledTimes(1);
	});

	it('calls onLoginWithGoogle when the Google button is clicked', async () => {
		const props = baseProps();
		const { getByText } = render(SignUpForm, { props });
		await fireEvent.click(getByText('Sign Up With Google'));
		expect(props.onLoginWithGoogle).toHaveBeenCalledTimes(1);
	});

	it('calls onRegister (via tryOrAlert) when the Create account button is clicked', async () => {
		const props = baseProps({ confirm: false });
		const { getByText } = render(SignUpForm, { props });
		await fireEvent.click(getByText('Create account'));
		expect(props.onRegister).toHaveBeenCalledTimes(1);
	});

	it('calls onConfirm (via tryOrAlert) when the Confirm Email button is clicked', async () => {
		const props = baseProps({ confirm: true });
		const { getByText } = render(SignUpForm, { props });
		await fireEvent.click(getByText('Confirm Email'));
		expect(props.onConfirm).toHaveBeenCalledTimes(1);
	});

	it('calls onShowLogin when the login link is clicked', async () => {
		const props = baseProps();
		const { getByLabelText } = render(SignUpForm, { props });
		await fireEvent.click(getByLabelText('showLoginForm'));
		expect(props.onShowLogin).toHaveBeenCalledTimes(1);
	});
});
