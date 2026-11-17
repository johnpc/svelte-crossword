import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
	handleForgotPassword: vi.fn().mockResolvedValue(undefined),
	registrationHandler: vi.fn().mockResolvedValue(undefined),
	confirmationHandler: vi.fn().mockResolvedValue(undefined),
	loginHandler: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('./loginLogic', () => mocks);

import { performRegistration, createLoginActions } from './loginPageActions';

describe('performRegistration', () => {
	beforeEach(() => vi.clearAllMocks());

	it('registers, moves sign-up to its code step, and notifies', async () => {
		const register = vi.fn().mockResolvedValue(undefined);
		const notify = vi.fn();
		const dispatch = vi.fn();
		await performRegistration({ username: 'a@b.com', password: 'pw', register, notify, dispatch });
		expect(register).toHaveBeenCalledWith('a@b.com', 'pw');
		expect(dispatch).toHaveBeenCalledWith('codeSent');
		expect(notify).toHaveBeenCalledWith(expect.stringContaining('confirmation code'));
	});
});

describe('createLoginActions', () => {
	const callbacks = vi.fn();
	const creds = { username: 'a@b.com', password: 'pw', confirmationCode: '123' };

	beforeEach(() => vi.clearAllMocks());

	it('onLogin delegates to loginHandler with current credentials', async () => {
		const actions = createLoginActions(() => creds, callbacks);
		await actions.onLogin();
		expect(mocks.loginHandler).toHaveBeenCalledWith('a@b.com', 'pw');
	});

	it('onConfirm delegates to confirmationHandler', async () => {
		const actions = createLoginActions(() => creds, callbacks);
		await actions.onConfirm();
		expect(mocks.confirmationHandler).toHaveBeenCalledWith('a@b.com', '123', 'pw', callbacks);
	});

	it('onSendReset requests a reset for the username only', async () => {
		const actions = createLoginActions(() => creds, callbacks);
		await actions.onSendReset();
		expect(mocks.handleForgotPassword).toHaveBeenCalledWith({ username: 'a@b.com' }, callbacks);
	});

	it('onConfirmReset submits the code and new password', async () => {
		const actions = createLoginActions(() => creds, callbacks);
		await actions.onConfirmReset();
		expect(mocks.handleForgotPassword).toHaveBeenCalledWith(
			{ username: 'a@b.com', confirmationCode: '123', newPassword: 'pw' },
			callbacks
		);
	});

	it('onRegister registers and moves to the confirmation-code step', async () => {
		const actions = createLoginActions(() => creds, callbacks);
		await actions.onRegister();
		expect(mocks.registrationHandler).toHaveBeenCalledWith('a@b.com', 'pw');
		expect(callbacks).toHaveBeenCalledWith('codeSent');
	});
});
