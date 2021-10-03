import util from './util.mjs';

const $module = {};

/**
 * Sets a specific cookie
 * @param name Name of the cookie to set
 * @param value Value to set
 * @param timespan Timspan to maintain the cookie in seconds
 */
$module.set = function (name, value, timespan) {
	if (!name) {
		console.warn('Unable to set a cookie without name');
		return;
	} 
	if (typeof (timespan) !== 'number') {
		console.warn('Invalid timespan has been provided. Setting the default value');
		timespan = 3600;
	}
	const expireDate = new Date();
	expireDate.setTime(expireDate.getTime() + (timespan * 1000));
	var cookie = util.trim(name) + '=' + value + '; expires=' + expireDate.toGMTString() + '; path=/';
	document.cookie = cookie;
};

/**
 * Obtains the value from a cookie
 * @param name Name of the cookie to obtain
 * @returns Cookie value or null if it is not defined
 */
$module.get = function (name) {
	if (!name) {
		return null;
	}
	const cookieArray = document.cookie.split(';');
	for (var idx = 0; idx < cookieArray.length; idx++) {
		const rawCookie = util.trim(cookieArray[idx]);
		if (!rawCookie) {
			continue;
		}
		const cookieParts = rawCookie.split('=');
		if (util.trim(cookieParts[0]) !== name) {
			continue;
		}
		return cookieParts[1];
	}
	return null;
};

export default $module;