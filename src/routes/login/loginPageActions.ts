import {
	handleForgotPassword,
	registrationHandler,
	confirmationHandler,
	loginHandler
} from './loginLogic';
import type { AuthFlowDispatch } from './authFlow';

export interface RegisterDeps {
	username: string;
	password: string;
	register?: typeof registrationHandler;
	notify?: (message: string) => void;
	dispatch: AuthFlowDispatch;
}

/**
 * Registers the account, moves the sign-up screen to its confirmation-code
 * step, and notifies the user to check their email.
 */
export const performRegistration = async (deps: RegisterDeps): Promise<void> => {
	const register = deps.register ?? registrationHandler;
	const notify = deps.notify ?? ((m: string) => alert(m));
	await register(deps.username, deps.password);
	deps.dispatch('codeSent');
	notify('Please check your email and enter confirmation code.');
};

/** Builds the auth action handlers a login page wires to its forms. */
export const createLoginActions = (
	getCredentials: () => { username: string; password: string; confirmationCode: string },
	dispatch: AuthFlowDispatch
) => ({
	onRegister: () => {
		const { username, password } = getCredentials();
		return performRegistration({ username, password, dispatch });
	},
	onConfirm: () => {
		const { username, password, confirmationCode } = getCredentials();
		return confirmationHandler(username, confirmationCode, password, dispatch);
	},
	onLogin: () => {
		const { username, password } = getCredentials();
		return loginHandler(username, password);
	},
	onSendReset: () => {
		const { username } = getCredentials();
		return handleForgotPassword({ username }, dispatch);
	},
	onConfirmReset: () => {
		const { username, password, confirmationCode } = getCredentials();
		return handleForgotPassword({ username, confirmationCode, newPassword: password }, dispatch);
	}
});
