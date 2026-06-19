/**
 * Svelte action: scrolls the node into view within its scrollable ancestor when focused.
 * @param {HTMLElement} node
 * @param {boolean} isFocused
 * @returns {{ update: (newIsFocused: boolean) => void }}
 */
export default function scrollTO(node, isFocused) {
	return {
		/** @param {boolean} newIsFocused */
		update(newIsFocused) {
			isFocused = newIsFocused;
			if (!isFocused) return;
			const list = node.parentElement?.parentElement;
			if (!list) return;

			const top = node.offsetTop;
			const currentYTop = list.scrollTop;
			const currentYBottom = currentYTop + list.clientHeight;
			const buffer = 50;
			if (top < currentYTop + buffer || top > currentYBottom - buffer) {
				list.scrollTo({ top: top, behavior: 'smooth' });
			}
		}
	};
}
