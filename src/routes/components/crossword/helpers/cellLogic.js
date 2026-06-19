/**
 * @typedef {object} KeydownAction
 * @property {string} type
 * @property {number} [diff]
 * @property {string} [value]
 * @property {import('./types').Direction} [direction]
 * @property {boolean} [preventDefault]
 */

/** @type {Record<string, [import('./types').Direction, number]>} */
const ARROW_MAP = {
	ArrowLeft: ['across', -1],
	ArrowRight: ['across', 1],
	ArrowUp: ['down', -1],
	ArrowDown: ['down', 1]
};

/**
 * @param {KeyboardEvent} e
 * @returns {KeydownAction | null | undefined}
 */
function getModifierAction(e) {
	if (e.ctrlKey && e.key.toLowerCase() === 'z') {
		return { type: 'historicalChange', diff: e.shiftKey ? 1 : -1 };
	}
	return e.ctrlKey || e.altKey ? null : undefined;
}

/**
 * @param {KeyboardEvent} e
 * @returns {KeydownAction | undefined}
 */
function getSpecialKeyAction(e) {
	if (e.key === 'Tab')
		return { type: 'focusClueDiff', diff: e.shiftKey ? -1 : 1, preventDefault: true };
	if (e.key === ' ') return { type: 'flipDirection', preventDefault: true };
	if (e.key === 'Delete' || e.key === 'Backspace') return { type: 'delete' };
	return undefined;
}

/**
 * @param {string} key
 * @returns {KeydownAction | null}
 */
function getArrowAction(key) {
	const diff = ARROW_MAP[key];
	return diff
		? { type: 'moveFocus', direction: diff[0], diff: diff[1], preventDefault: true }
		: null;
}

/**
 * @param {KeyboardEvent} e
 * @returns {KeydownAction | null | undefined}
 */
export function getKeydownAction(e) {
	const modAction = getModifierAction(e);
	if (modAction !== undefined) return modAction;
	const special = getSpecialKeyAction(e);
	if (special !== undefined) return special;
	if (/^[\x21-\x7e]$/.test(e.key)) return { type: 'letter', value: e.key.toUpperCase() };
	return getArrowAction(e.key);
}

/**
 * Svelte transition: slides the node up into place.
 * @param {Element | null} node
 * @param {{ delay?: number, duration?: number }} [params]
 * @returns {{ delay: number, duration: number, css: (t: number) => string }}
 */
export function popTransition(node, { delay = 0, duration = 250 } = {}) {
	return {
		delay,
		duration,
		css: (/** @type {number} */ t) => `transform: translate(0, ${1 - t}px)`
	};
}
