import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.johncorser.smallcrosswords',
	appName: 'Small Crosswords',
	webDir: 'build',
	bundledWebRuntime: false,
	server: {
		androidScheme: 'https'
	}
};

export default config;
