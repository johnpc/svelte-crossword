import staticAdapter from '@sveltejs/adapter-static';
import adapter from 'amplify-adapter';

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: process.env.CAPACITOR_BUILD ? staticAdapter({ strict: false }) : adapter(),
		csrf: {
			// Capacitor native builds submit from capacitor:// / file:// origins, so all
			// origins are trusted here. Equivalent to the deprecated `checkOrigin: false`.
			trustedOrigins: ['*']
		}
	}
};

export default config;
