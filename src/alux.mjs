'use strict';

const $scope = {};
$scope.version = { major: 1, minor: 0, patch: 0 };
console.log('%cAlux Framework ' + version(), 'color: #64dd17;');

/**
 * Allows to obtain the current framework version.  If a boolean true is passed as an argument then a 
 * canonical represenration of the version will be produced.
 * @returns Version number as a string or canonical (as an object)
 */
export function version() {
    if(arguments.length === 1 && arguments[0] === true) {
        return {
            major: $scope.version.major,
            minor: $scope.version.minor,
            patch: $scope.version.patch
        };
    }
    return 'v' + $scope.version.major + '.' + $scope.version.minor + '.' + $scope.version.patch;
};

import log from './logging';
import util from './util';
import cookies from './cookies';
import http from './http';
import controller from './controller';
import fragment from './fragment';
import router from './router';
import errorHandler from './errorHandler';
import ui from './components/ui';

/**
 * Adds a function to be executed when the framework has completed the loading process
 * @param fnc Function to be invoked once the framework is ready
 */
export function ready(fnc) {
    util.events.onReady(fnc);
};

/**
 * Captures an unhandled promise and process any error rendering it to the UI and logging the cause
 * @param promise Promise to handle
 */
export function handle(promise) {
    if(!util.isPromise(promise)) {
        throw Error('alux.handle_promise.invalid_promise');
    }
    promise.catch((err) => {
        errorHandler.render(err);
    });
};

export { log, util, cookies, http, controller, fragment, router, errorHandler, ui };