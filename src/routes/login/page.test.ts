import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';

vi.mock('aws-amplify', () => ({ Amplify: { configure: vi.fn() } }));
vi.mock('../../amplify_outputs.json', () => ({ default: { custom: {} } }));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
// aws-amplify/auth is pulled in transitively by loginLogic / loginPageActions.
vi.mock('aws-amplify/auth', () => ({
	signUp: vi.fn(),
	signIn: vi.fn(),
	confirmSignUp: vi.fn(),
	signInWithRedirect: vi.fn(),
	resetPassword: vi.fn(),
	confirmResetPassword: vi.fn()
}));
const mockIsNative = vi.fn(() => false);
vi.mock('@capacitor/core', () => ({
	Capacitor: { isNativePlatform: () => mockIsNative() }
}));

import Page from './+page.svelte';

describe('login/+page.svelte', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockIsNative.mockReturnValue(false);
	});

	it('shows the sign-in form by default', () => {
		const { getByText, getByRole, queryByText } = render(Page);
		expect(getByText('Log In')).toBeInTheDocument();
		expect(getByRole('button', { name: 'Log in' })).toBeInTheDocument();
		// Other forms are not rendered yet.
		expect(queryByText('Register')).toBeNull();
		expect(queryByText('Reset Password')).toBeNull();
	});

	it('switches to the sign-up form when "Create an Account" is clicked', async () => {
		const { getByLabelText, getByText, queryByRole } = render(Page);
		await fireEvent.click(getByLabelText('showRegistrationForm'));
		await waitFor(() => expect(getByText('Register')).toBeInTheDocument());
		// The sign-in form (and its "Log in" submit button) is gone.
		expect(queryByRole('button', { name: 'Log in' })).toBeNull();
		expect(getByText('Create account')).toBeInTheDocument();
	});

	it('switches to the forgot-password form when "forgot?" is clicked', async () => {
		const { getByText, queryByRole } = render(Page);
		await fireEvent.click(getByText('forgot?'));
		await waitFor(() => expect(getByText('Reset Password')).toBeInTheDocument());
		expect(queryByRole('button', { name: 'Log in' })).toBeNull();
		expect(getByText('Send Reset Email')).toBeInTheDocument();
	});

	it('can return to the sign-in form from the sign-up form', async () => {
		const { getByLabelText, getByText, getByRole, queryByText } = render(Page);
		await fireEvent.click(getByLabelText('showRegistrationForm'));
		await waitFor(() => expect(getByText('Register')).toBeInTheDocument());
		await fireEvent.click(getByLabelText('showLoginForm'));
		await waitFor(() => expect(getByRole('button', { name: 'Log in' })).toBeInTheDocument());
		expect(queryByText('Register')).toBeNull();
	});
});
