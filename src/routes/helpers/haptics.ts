import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const haptic = async () => {
	try {
		await Haptics.impact({ style: ImpactStyle.Medium });
	} catch (e) {
		console.warn(`Unable to use haptics`, e);
	}
};

export const vibrate = async () => {
	try {
		await Haptics.vibrate();
	} catch (e) {
		console.warn(`Unable to vibrate`, e);
	}
};
