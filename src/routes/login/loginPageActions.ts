import {
	handleForgotPassword,
	registrationHandler,
	confirmationHandler,
	loginHandler,
	type StateCallbacks
} from './loginLogic';

export interface RegisterDeps {
	username: string;
	password: string;
	register?: typeof registrationHandler;
	notify?: (message: string) => void;
	onAwaitingConfirmation: () => void;
}

/**
 * Registers the account, flips the page into "awaiting confirmation code"
 * state, and notifies the user to check their email.
 */
export const performRegistration = async (deps: RegisterDeps): Promise<void> => {
	const register = deps.register ?? registrationHandler;
	const notify = deps.notify ?? ((m: string) => alert(m));
	await register(deps.username, deps.password);
	deps.onAwaitingConfirmation();
	notify('Please check your email and enter confirmation code.');
};

/** Builds the auth action handlers a login page wires to its forms. */
export const createLoginActions = (
	getCredentials: () => { username: string; password: string; confirmationCode: string },
	callbacks: StateCallbacks,
	onAwaitingConfirmation: () => void
) => ({
	onRegister: () => {
		const { username, password } = getCredentials();
		return performRegistration({ username, password, onAwaitingConfirmation });
	},
	onConfirm: () => {
		const { username, password, confirmationCode } = getCredentials();
		return confirmationHandler(username, confirmationCode, password, callbacks);
	},
	onLogin: () => {
		const { username, password } = getCredentials();
		return loginHandler(username, password);
	},
	onSendReset: () => {
		const { username } = getCredentials();
		return handleForgotPassword({ username }, callbacks);
	},
	onConfirmReset: () => {
		const { username, password, confirmationCode } = getCredentials();
		return handleForgotPassword({ username, confirmationCode, newPassword: password }, callbacks);
	}
});
