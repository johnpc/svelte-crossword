import { resetPassword, confirmResetPassword, type ResetPasswordOutput } from 'aws-amplify/auth';
import type { AuthFlowDispatch } from './authFlow';

export function handleResetPasswordNextSteps(
	output: ResetPasswordOutput,
	dispatch: AuthFlowDispatch
): void {
	const { nextStep } = output;
	switch (nextStep.resetPasswordStep) {
		case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
			dispatch('codeSent');
			break;
		case 'DONE':
			dispatch('completed');
			break;
	}
}

export async function handleForgotPassword(
	forgotPasswordArgs: {
		username: string;
		confirmationCode?: string;
		newPassword?: string;
	},
	dispatch: AuthFlowDispatch
): Promise<void> {
	if (!forgotPasswordArgs.username) {
		throw new Error('No email specified');
	}
	if (forgotPasswordArgs.confirmationCode && forgotPasswordArgs.newPassword) {
		await confirmResetPassword(
			forgotPasswordArgs as { username: string; confirmationCode: string; newPassword: string }
		);
		dispatch('completed');
	} else {
		const output = await resetPassword(forgotPasswordArgs);
		handleResetPasswordNextSteps(output, dispatch);
	}
}
