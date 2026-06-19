import { describe, it, expect, vi, beforeEach } from 'vitest';
import checkMobile from './checkMobile.js';

describe('checkMobile', () => {
	beforeEach(() => {
		vi.stubGlobal('navigator', { userAgent: '' });
	});

	it('returns truthy for Android user agent', () => {
		vi.stubGlobal('navigator', {
			userAgent: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
		});
		expect(checkMobile()).toBeTruthy();
	});

	it('returns truthy for iPhone user agent', () => {
		vi.stubGlobal('navigator', {
			userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0) AppleWebKit/605.1.15'
		});
		expect(checkMobile()).toBeTruthy();
	});

	it('returns truthy for iPad user agent', () => {
		vi.stubGlobal('navigator', {
			userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0) AppleWebKit/605.1.15'
		});
		expect(checkMobile()).toBeTruthy();
	});

	it('returns truthy for BlackBerry user agent', () => {
		vi.stubGlobal('navigator', {
			userAgent: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900)'
		});
		expect(checkMobile()).toBeTruthy();
	});

	it('returns truthy for Opera Mini user agent', () => {
		vi.stubGlobal('navigator', {
			userAgent: 'Opera/9.80 (J2ME/MIDP; Opera Mini/5.0)'
		});
		expect(checkMobile()).toBeTruthy();
	});

	it('returns truthy for Windows Phone user agent', () => {
		vi.stubGlobal('navigator', {
			userAgent: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; IEMobile/10.0)'
		});
		expect(checkMobile()).toBeTruthy();
	});

	it('returns falsy for desktop user agent', () => {
		vi.stubGlobal('navigator', {
			userAgent:
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0'
		});
		expect(checkMobile()).toBeFalsy();
	});
});
