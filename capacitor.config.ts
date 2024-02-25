import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.johncorser.smallcrosswords',
	appName: 'Small Crosswords',
	webDir: 'build',
	bundledWebRuntime: false,
	server: {
		androidScheme: 'https'
	},
	ios: {
		contentInset: 'always',
		backgroundColor: '#DB7093'
	}
};

export default config;
