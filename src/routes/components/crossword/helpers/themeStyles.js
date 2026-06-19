import classic from '../themes/classic.js';
import dark from '../themes/dark.js';
import citrus from '../themes/citrus.js';
import amelia from '../themes/amelia.js';
import pink from '../themes/pink.js';

/** @type {Record<string, Record<string, string>>} */
const themes = { classic, dark, citrus, amelia, pink };
const defaultTheme = themes['classic'];

/** @type {Record<string, string>} */
const themeStyles = {};

Object.keys(themes).forEach((t) => {
	themeStyles[t] = Object.keys(defaultTheme)
		.map((d) => `--${d}: var(--xd-${d}, ${themes[t][d] || defaultTheme[d]})`)
		.join(';');
});

export default themeStyles;
