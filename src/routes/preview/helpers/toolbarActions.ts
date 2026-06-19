import { haptic } from '../../helpers/haptics';

type ToolbarActionResult = {
	action: string;
};

export const onToolbarClear = (onClear: () => void): ToolbarActionResult => {
	haptic();
	onClear();
	return { action: 'clear' };
};

export const onToolbarReveal = (onReveal: () => void): ToolbarActionResult => {
	haptic();
	onReveal();
	return { action: 'reveal' };
};

export const onToolbarCheck = (onCheck: () => void): ToolbarActionResult => {
	haptic();
	onCheck();
	return { action: 'check' };
};

export const toggleKeyboardSetting = (current: boolean): boolean => {
	const next = !current;
	localStorage.setItem('showAppKeyboard', String(next));
	return next;
};
