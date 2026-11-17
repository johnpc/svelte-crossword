const KEY = 'showAppKeyboard';

/** Whether the on-screen keyboard is shown; defaults to on for first-time users. */
export const readKeyboardSetting = (): boolean => localStorage.getItem(KEY) !== 'false';

export const toggleKeyboardSetting = (current: boolean): boolean => {
	const next = !current;
	localStorage.setItem(KEY, String(next));
	return next;
};
