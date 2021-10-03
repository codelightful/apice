const $scope = {};
if (!$scope.init) {
	$scope.init = true;
	$scope.log = console.log;
	$scope.error = console.error;
	$scope.warn = console.warn;
	$scope.info = console.info;
}

/**
 * Mocks the console and executes a specific action while it is mocked
 * @param callback Function with the implementation to execute while the console is being mocked. The function will
 * 			receive an array with the console entries.
 * @returns Function to be part of the test suite action
 */
export default function (callback) {
	return function() {
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
		callback(entries);
		console.log = $scope.log;
		console.error = $scope.error;
		console.warn = $scope.warn;
		console.info = $scope.info;
	}
};