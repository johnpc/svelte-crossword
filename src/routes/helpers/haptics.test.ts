import { describe, it, expect, vi } from 'vitest';

vi.mock('@capacitor/haptics', () => ({
	Haptics: {
		impact: vi.fn().mockResolvedValue(undefined),
		vibrate: vi.fn().mockResolvedValue(undefined)
	},
	ImpactStyle: {
		Medium: 'MEDIUM'
	}
}));

import { haptic, vibrate } from './haptics';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

describe('haptics', () => {
	it('calls Haptics.impact with Medium style', async () => {
		await haptic();
		expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Medium });
	});

	it('does not throw when Haptics.impact fails', async () => {
		vi.mocked(Haptics.impact).mockRejectedValueOnce(new Error('Not available'));
		await expect(haptic()).resolves.toBeUndefined();
	});

	it('calls Haptics.vibrate', async () => {
		await vibrate();
		expect(Haptics.vibrate).toHaveBeenCalled();
	});

	it('does not throw when Haptics.vibrate fails', async () => {
		vi.mocked(Haptics.vibrate).mockRejectedValueOnce(new Error('Not available'));
		await expect(vibrate()).resolves.toBeUndefined();
	});
});
