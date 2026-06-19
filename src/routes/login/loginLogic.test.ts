import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
	goto: vi.fn(),
	signUp: vi.fn().mockResolvedValue({}),
	signIn: vi.fn().mockResolvedValue({}),
	confirmSignUp: vi.fn().mockResolvedValue({}),
	resetPassword: vi.fn().mockResolvedValue({ nextStep: { resetPasswordStep: 'DONE' } }),
	confirmResetPassword: vi.fn().mockResolvedValue({}),
	signInWithRedirect: vi.fn().mockResolvedValue({})
}));

vi.mock('$app/navigation', () => ({ goto: mocks.goto }));

vi.mock('aws-amplify/auth', () => ({
	signUp: mocks.signUp,
	signIn: mocks.signIn,
	confirmSignUp: mocks.confirmSignUp,
	resetPassword: mocks.resetPassword,
	confirmResetPassword: mocks.confirmResetPassword,
	signInWithRedirect: mocks.signInWithRedirect
}));

vi.mock('aws-amplify', () => ({
	Amplify: { getConfig: () => ({ Auth: { Cognito: {} } }) }
}));

import {
	handleResetPasswordNextSteps,
	loginWithApple,
	loginWithGoogle,
	handleForgotPassword,
	registrationHandler,
	confirmationHandler,
	loginHandler,
	tryOrAlert,
	type StateCallbacks
} from './loginLogic';

describe('loginLogic', () => {
	let callbacks: StateCallbacks;

	beforeEach(() => {
		vi.clearAllMocks();
		callbacks = {
			setConfirmForgotPassword: vi.fn(),
			setState: vi.fn(),
			setConfirm: vi.fn()
		};
	});

	describe('handleResetPasswordNextSteps', () => {
		it('sets confirmForgotPassword true on CONFIRM_RESET_PASSWORD_WITH_CODE', () => {
			const output = {
				nextStep: {
					resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE' as const,
					codeDeliveryDetails: { deliveryMedium: 'EMAIL' as const }
				}
			};
			handleResetPasswordNextSteps(output as never, callbacks);
			expect(callbacks.setConfirmForgotPassword).toHaveBeenCalledWith(true);
		});

		it('sets state to signIn on DONE', () => {
			const output = { nextStep: { resetPasswordStep: 'DONE' as const } };
			handleResetPasswordNextSteps(output as never, callbacks);
			expect(callbacks.setConfirmForgotPassword).toHaveBeenCalledWith(false);
			expect(callbacks.setState).toHaveBeenCalledWith('signIn');
		});
	});

	describe('loginWithApple', () => {
		it('calls signInWithRedirect with Apple provider', async () => {
			await loginWithApple();
			expect(mocks.signInWithRedirect).toHaveBeenCalledWith({ provider: 'Apple' });
			expect(mocks.goto).toHaveBeenCalledWith('/');
		});
	});

	describe('loginWithGoogle', () => {
		it('calls signInWithRedirect with Google provider', async () => {
			await loginWithGoogle();
			expect(mocks.signInWithRedirect).toHaveBeenCalledWith({ provider: 'Google' });
			expect(mocks.goto).toHaveBeenCalledWith('/');
		});
	});

	describe('handleForgotPassword', () => {
		it('throws if username is empty', async () => {
			await expect(handleForgotPassword({ username: '' }, callbacks)).rejects.toThrow(
				'No email specified'
			);
		});

		it('calls resetPassword when no confirmationCode', async () => {
			mocks.resetPassword.mockResolvedValueOnce({
				nextStep: { resetPasswordStep: 'DONE' }
			});
			await handleForgotPassword({ username: 'test@test.com' }, callbacks);
			expect(mocks.resetPassword).toHaveBeenCalledWith({ username: 'test@test.com' });
		});

		it('calls confirmResetPassword with code and new password', async () => {
			await handleForgotPassword(
				{ username: 'test@test.com', confirmationCode: '123', newPassword: 'newpass' },
				callbacks
			);
			expect(mocks.confirmResetPassword).toHaveBeenCalledWith({
				username: 'test@test.com',
				confirmationCode: '123',
				newPassword: 'newpass'
			});
			expect(callbacks.setConfirmForgotPassword).toHaveBeenCalledWith(false);
			expect(callbacks.setState).toHaveBeenCalledWith('signIn');
		});
	});

	describe('registrationHandler', () => {
		it('calls signUp with username and password', async () => {
			await registrationHandler('user@test.com', 'pass123');
			expect(mocks.signUp).toHaveBeenCalledWith({
				username: 'user@test.com',
				password: 'pass123'
			});
		});
	});

	describe('confirmationHandler', () => {
		it('calls confirmSignUp and loginHandler when password exists', async () => {
			await confirmationHandler('user@test.com', '123456', 'pass', callbacks);
			expect(mocks.confirmSignUp).toHaveBeenCalledWith({
				username: 'user@test.com',
				confirmationCode: '123456'
			});
			expect(callbacks.setState).toHaveBeenCalledWith('signIn');
			expect(mocks.signIn).toHaveBeenCalledWith({
				username: 'user@test.com',
				password: 'pass'
			});
		});

		it('alerts when no password', async () => {
			const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
			await confirmationHandler('user@test.com', '123456', '', callbacks);
			expect(alertSpy).toHaveBeenCalledWith('Success. Now please log in');
			alertSpy.mockRestore();
		});
	});

	describe('loginHandler', () => {
		it('calls signIn and navigates to /', async () => {
			await loginHandler('user@test.com', 'pass123');
			expect(mocks.signIn).toHaveBeenCalledWith({
				username: 'user@test.com',
				password: 'pass123'
			});
			expect(mocks.goto).toHaveBeenCalledWith('/');
		});
	});

	describe('tryOrAlert', () => {
		it('calls the provided function', async () => {
			const fn = vi.fn().mockResolvedValue(undefined);
			await tryOrAlert(fn);
			expect(fn).toHaveBeenCalled();
		});

		it('alerts on error', async () => {
			const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
			const fn = vi.fn().mockRejectedValue(new Error('fail'));
			await tryOrAlert(fn);
			expect(alertSpy).toHaveBeenCalledWith('Error: fail');
			alertSpy.mockRestore();
		});
	});
});
