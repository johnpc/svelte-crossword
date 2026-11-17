import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPush = vi.fn();
vi.mock('@zerodevx/svelte-toast', () => ({
	toast: { push: (...args: unknown[]) => mockPush(...args) }
}));

import { showPreviewToast } from './toastConfig';

describe('toastConfig', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('pushes the sign-up prompt toast', () => {
		showPreviewToast();
		expect(mockPush).toHaveBeenCalledOnce();
		expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('Sign in/up'));
	});
});
