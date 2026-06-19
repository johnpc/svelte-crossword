import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

vi.mock('./loginLogic', () => ({
	tryOrAlert: (fn: () => unknown) => fn()
}));

import ForgotPasswordForm from './ForgotPasswordForm.svelte';

function baseProps(overrides = {}) {
	return {
		username: '',
		password: '',
		confirmationCode: '',
		confirmForgotPassword: false,
		onSendReset: vi.fn(),
		onConfirmReset: vi.fn(),
		onShowRegistration: vi.fn(),
		...overrides
	};
}

describe('ForgotPasswordForm', () => {
	beforeEach(() => vi.clearAllMocks());

	it('renders the heading and email input', () => {
		const { getByText, container } = render(ForgotPasswordForm, { props: baseProps() });
		expect(getByText('Reset Password')).toBeTruthy();
		expect(container.querySelector('#email')).toBeTruthy();
	});

	it('shows the Send Reset Email button and no confirmation UI when confirmForgotPassword is false', () => {
		const { getByText, queryByText, container } = render(ForgotPasswordForm, {
			props: baseProps({ confirmForgotPassword: false })
		});
		expect(getByText('Send Reset Email')).toBeTruthy();
		expect(queryByText('Confirm Password Reset')).toBeNull();
		expect(container.querySelector('#confirmation')).toBeNull();
	});

	it('shows the confirmation UI and no Send Reset Email button when confirmForgotPassword is true', () => {
		const { getByText, queryByText, container } = render(ForgotPasswordForm, {
			props: baseProps({ confirmForgotPassword: true })
		});
		expect(getByText('Confirm Password Reset')).toBeTruthy();
		expect(getByText('A confirmation code was sent to your email.')).toBeTruthy();
		expect(getByText('Confirmation Code')).toBeTruthy();
		expect(queryByText('Send Reset Email')).toBeNull();
		expect(container.querySelector('#confirmation')).toBeTruthy();
		expect(container.querySelector('#password')).toBeTruthy();
	});

	it('calls onSendReset (via tryOrAlert) when the Send Reset Email button is clicked', async () => {
		const props = baseProps({ confirmForgotPassword: false });
		const { getByText } = render(ForgotPasswordForm, { props });
		await fireEvent.click(getByText('Send Reset Email'));
		expect(props.onSendReset).toHaveBeenCalledTimes(1);
	});

	it('calls onConfirmReset (via tryOrAlert) when the Confirm Password Reset button is clicked', async () => {
		const props = baseProps({ confirmForgotPassword: true });
		const { getByText } = render(ForgotPasswordForm, { props });
		await fireEvent.click(getByText('Confirm Password Reset'));
		expect(props.onConfirmReset).toHaveBeenCalledTimes(1);
	});

	it('calls onShowRegistration when the registration link is clicked', async () => {
		const props = baseProps();
		const { getByLabelText } = render(ForgotPasswordForm, { props });
		await fireEvent.click(getByLabelText('showRegistrationForm'));
		expect(props.onShowRegistration).toHaveBeenCalledTimes(1);
	});
});
