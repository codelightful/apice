const $scope = {};
if (!$scope.init) {
	$scope.init = true;
	$scope.log = console.log;
	$scope.error = console.error;
	$scope.warn = console.warn;
	$scope.info = console.info;
}

/**
 * Internal method that mock the console and executes a particular action
 * @param callback Function with the action to execute
 * @param done Optional argument with the callback to report the completion for async testing
 */
function runWithMockedConsole(callback, done) {
	const entries = [];
	const mock = function(text, ...args) {
		if (args) {
			entries.push(text + ' ' + JSON.stringify(args));
		} else {
			entries.push(text);
		}
	}
	console.log = mock;
	console.error = mock;
	console.warn = mock;
	console.info = mock;
	callback(entries, done);
	console.log = $scope.log;
	console.error = $scope.error;
	console.warn = $scope.warn;
	console.info = $scope.info;
}

/**
 * Mocks the console and executes a specific action while it is mocked
 * @param callback Function with the implementation to execute while the console is being mocked. The function will
 * 			receive an array with the console entries.
 * @returns Function to be part of the test suite action
 */
const $module = function (callback) {
	return function() {
		runWithMockedConsole(callback);
	}
};

/**
 * Mocks the console and executes a specific action while it is mocked allowing to have a done parameter binded to the
 * return function. This is particulary useful for async testing with mocha.
 * @param callback Function with the implementation to execute while the console is being mocked. The function will
 * 			receive an array with the console entries.
 * @returns Function to be part of the test suite action
 */
$module.done = function(callback) {
	return function(done) {
		runWithMockedConsole(callback, done);
	}
};

export default $module;