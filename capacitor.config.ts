import { CapacitorConfig } from '@capacitor/cli';
import dotenv from 'dotenv';
dotenv.config();

const config: CapacitorConfig = {
	appId: 'com.johncorser.crosswords',
	appName: 'Small Crosswords',
	webDir: 'build',
	bundledWebRuntime: false,
	server: {
		androidScheme: 'https'
	},
	ios: {
		contentInset: 'always',
		backgroundColor: '#DB7093'
	},
	android: {
		buildOptions: {
			keystorePath: process.env.ANDROID_KEYSTORE_PATH,
			keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD,
			keystoreAlias: process.env.ANDROID_KEYSTORE_ALIAS,
			keystoreAliasPassword: process.env.ANDROID_KEYSTORE_ALIAS_PASSWORD
		}
	}
};

export default config;
