export type Theme = 'light' | 'dark' | 'system';

export const getStoredTheme = (): Theme => {
	const stored = localStorage.getItem('theme');
	if (stored === 'light' || stored === 'dark' || stored === 'system') {
		return stored;
	}
	return 'system';
};

export const applyTheme = (theme: Theme): void => {
	if (theme === 'system') {
		document.documentElement.removeAttribute('data-theme');
	} else {
		document.documentElement.setAttribute('data-theme', theme);
	}
	localStorage.setItem('theme', theme);
};

export const cycleTheme = (current: Theme): Theme => {
	if (current === 'light') return 'dark';
	if (current === 'dark') return 'system';
	return 'light';
};

export const getThemeIcon = (theme: Theme): string => {
	if (theme === 'light') return '☀️';
	if (theme === 'dark') return '🌙';
	return '💻';
};
