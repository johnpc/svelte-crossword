const ARROW_MAP = {
	ArrowLeft: ['across', -1],
	ArrowRight: ['across', 1],
	ArrowUp: ['down', -1],
	ArrowDown: ['down', 1]
};

function getModifierAction(e) {
	if (e.ctrlKey && e.key.toLowerCase() === 'z') {
		return { type: 'historicalChange', diff: e.shiftKey ? 1 : -1 };
	}
	return e.ctrlKey || e.altKey ? null : undefined;
}

function getSpecialKeyAction(e) {
	if (e.key === 'Tab')
		return { type: 'focusClueDiff', diff: e.shiftKey ? -1 : 1, preventDefault: true };
	if (e.key === ' ') return { type: 'flipDirection', preventDefault: true };
	if (e.key === 'Delete' || e.key === 'Backspace') return { type: 'delete' };
	return undefined;
}

function getArrowAction(key) {
	const diff = ARROW_MAP[key];
	return diff
		? { type: 'moveFocus', direction: diff[0], diff: diff[1], preventDefault: true }
		: null;
}

export function getKeydownAction(e) {
	const modAction = getModifierAction(e);
	if (modAction !== undefined) return modAction;
	const special = getSpecialKeyAction(e);
	if (special !== undefined) return special;
	if (/^[a-zA-Z()]$/.test(e.key)) return { type: 'letter', value: e.key.toUpperCase() };
	return getArrowAction(e.key);
}

export function popTransition(node, { delay = 0, duration = 250 } = {}) {
	return { delay, duration, css: (t) => `transform: translate(0, ${1 - t}px)` };
}
