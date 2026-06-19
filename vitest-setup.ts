import '@testing-library/jest-dom/vitest';

// jsdom does not implement the Web Animations API that Svelte's built-in
// transitions (fade, fly, the crossword pop transition, etc.) rely on. Provide
// a stub that completes synchronously so `transition:`/`animate:` directives —
// including out-transitions that gate element removal — settle immediately in
// tests instead of hanging.
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
	Element.prototype.animate = function animate() {
		let onfinish: ((this: Animation, ev: Event) => unknown) | null = null;
		const finished = Promise.resolve();
		const anim = {
			cancel() {},
			finish() {},
			play() {},
			pause() {},
			reverse() {},
			addEventListener(type: string, cb: () => void) {
				if (type === 'finish') queueMicrotask(cb);
			},
			removeEventListener() {},
			finished,
			currentTime: 0,
			startTime: 0,
			playState: 'finished',
			set onfinish(cb: ((this: Animation, ev: Event) => unknown) | null) {
				onfinish = cb;
				if (cb) queueMicrotask(() => cb.call(this as unknown as Animation, new Event('finish')));
			},
			get onfinish() {
				return onfinish;
			},
			oncancel: null
		};
		return anim as unknown as Animation;
	};
}
