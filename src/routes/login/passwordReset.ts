import { resetPassword, confirmResetPassword, type ResetPasswordOutput } from 'aws-amplify/auth';
import type { StateCallbacks } from './types';

export function handleResetPasswordNextSteps(
	output: ResetPasswordOutput,
	callbacks: StateCallbacks
): void {
	const { nextStep } = output;
	switch (nextStep.resetPasswordStep) {
		case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
			console.log(`Confirmation code was sent to ${nextStep.codeDeliveryDetails.deliveryMedium}`);
			callbacks.setConfirmForgotPassword(true);
			break;
		case 'DONE':
			callbacks.setConfirmForgotPassword(false);
			callbacks.setState('signIn');
			break;
	}
}

export async function handleForgotPassword(
	forgotPasswordArgs: {
		username: string;
		confirmationCode?: string;
		newPassword?: string;
	},
	callbacks: StateCallbacks
): Promise<void> {
	if (!forgotPasswordArgs.username) {
		throw new Error('No email specified');
	}
	if (forgotPasswordArgs.confirmationCode! && forgotPasswordArgs.newPassword!) {
		await confirmResetPassword(
			forgotPasswordArgs as { username: string; confirmationCode: string; newPassword: string }
		);
		callbacks.setConfirmForgotPassword(false);
		callbacks.setState('signIn');
	} else {
		const output = await resetPassword(forgotPasswordArgs);
		handleResetPasswordNextSteps(output, callbacks);
	}
}
