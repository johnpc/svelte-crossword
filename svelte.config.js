import staticAdapter from '@sveltejs/adapter-static';
import adapter from 'amplify-adapter';

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: process.env.CAPACITOR_BUILD ? staticAdapter({ strict: false }) : adapter(),
		csrf: {
			checkOrigin: false
		}
	}
};

export default config;
