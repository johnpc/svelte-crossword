export type AuthState = 'signIn' | 'signUp' | 'forgotPassword';

export interface StateCallbacks {
	setConfirmForgotPassword: (value: boolean) => void;
	setState: (value: AuthState) => void;
	setConfirm: (value: boolean) => void;
}
