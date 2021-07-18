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

import logger from './logger.mjs';
import events from './events.mjs';
import cookies from './cookies.mjs';
import http from './http.mjs';
import fragment from './fragment.mjs';

/**
 * Adds a function to be executed when the framework has completed the loading process
 * @param callback Function to be invoked once the framework is ready
 */
export function ready(callback) {
    events.on('ready', callback);
};

export { logger, events, cookies, http, fragment };