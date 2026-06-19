import { describe, it, expect, vi } from 'vitest';
import scrollTO from './scrollTo.js';

function createMockNode(offsetTop = 100) {
	const list = {
		scrollTop: 0,
		clientHeight: 200,
		scrollTo: vi.fn()
	};
	return {
		node: /** @type {HTMLElement} */ (
			/** @type {unknown} */ ({
				offsetTop,
				parentElement: {
					parentElement: list
				}
			})
		),
		list
	};
}

describe('scrollTo', () => {
	it('returns an object with an update method', () => {
		const { node } = createMockNode();
		const result = scrollTO(node, false);
		expect(result).toHaveProperty('update');
		expect(typeof result.update).toBe('function');
	});

	it('does not scroll when not focused', () => {
		const { node, list } = createMockNode();
		const action = scrollTO(node, false);
		action.update(false);
		expect(list.scrollTo).not.toHaveBeenCalled();
	});

	it('scrolls when focused and element is above viewport', () => {
		const { node, list } = createMockNode(10);
		list.scrollTop = 100;
		const action = scrollTO(node, false);
		action.update(true);
		expect(list.scrollTo).toHaveBeenCalledWith({ top: 10, behavior: 'smooth' });
	});

	it('scrolls when focused and element is below viewport', () => {
		const { node, list } = createMockNode(300);
		list.scrollTop = 0;
		list.clientHeight = 200;
		const action = scrollTO(node, false);
		action.update(true);
		expect(list.scrollTo).toHaveBeenCalledWith({ top: 300, behavior: 'smooth' });
	});

	it('does not scroll when element is within viewport', () => {
		const { node, list } = createMockNode(100);
		list.scrollTop = 0;
		list.clientHeight = 300;
		const action = scrollTO(node, false);
		action.update(true);
		expect(list.scrollTo).not.toHaveBeenCalled();
	});

	it('handles missing parent gracefully', () => {
		const node = /** @type {HTMLElement} */ (
			/** @type {unknown} */ ({
				offsetTop: 100,
				parentElement: { parentElement: null }
			})
		);
		const action = scrollTO(node, false);
		expect(() => action.update(true)).not.toThrow();
	});
});
