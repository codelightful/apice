'use strict';

import logging from './logging.mjs';
import util from './util.mjs';
import events from './events.mjs';
import element from './element.mjs';
import cookies from './cookies.mjs';
import http from './http.mjs';
import controller from './controller.mjs';
import fragment from './fragment.mjs';
import router from './router.mjs';
import error from './errorHandler.mjs';
import ui from './components/ui.mjs';
import form from './components/form.mjs';
import asynchronous from './asynchronous.mjs';
import currentVersion from './version.mjs';

console.log(`%cApice Framework ${version()}`, 'color: #64dd17;');

/**
 * Allows to obtain the current framework version.  If a boolean true is passed as an argument then a 
 * canonical represenration of the version will be produced.
 * @returns Version number as a string or canonical (as an object)
 */
function version() {
	if (arguments[0] === true) {
		return {
			major: currentVersion.major,
			minor: currentVersion.minor,
			patch: currentVersion.patch
		};
	}
	return 'v' + currentVersion.major + '.' + currentVersion.minor + '.' + currentVersion.patch;
}

/**
 * Adds a function to be executed when the framework has completed the loading process
 * @param callback Function to be invoked once the framework is ready
 */
function ready(callback) {
	events.documentReady(callback);
}

export default { 
	version, ready, 
	logging, 
	util, 
	events, 
	element, 
	cookies, 
	http, 
	controller, 
	fragment, 
	router, 
	error, 
	ui, 
	form, 
	asynchronous 
};
