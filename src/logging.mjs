/*
Apice Logger Module
v1.0.0
*/
import util from './util.mjs';
import cookies from './cookies.mjs';

const $module = {};
const $scope = {};

// contains all the loggers registered
$scope.loggers = {};
// dictionary with all the defined log levels
$scope.levels = {
	fatal: { value: 10, color: '#ff4444', label: 'FATAL' },
	error: { value: 20, color: '#ff4444', label: 'ERROR' },
	warn: { value: 30, color: '#ff8800', label: 'WARNING' },
	info: { value: 40, color: '#0099cc', label: 'INFO' },
	debug: { value: 50, color: '#3E4551', label: 'DEBUG' },
	trace: { value: 60, color: '#3E4551', label: 'TRACE' }
};

var levelCookie = cookies.get('apice.logger.level');
if (!levelCookie) {
	$scope.globalLevel = $scope.levels.warn;
} else {
	$scope.globalLevel = $scope.levels[levelCookie];
	if (!$scope.globalLevel) {
		$scope.globalLevel = $scope.levels.warn;
	}
}

/** Represents a specific logger */
class Logger {
	// holds the name or identigier of the current logger
	#name;
	// log level defined for the logger instance
	#level;

	constructor(name) {
		this.#name = name;
		var levelCookie = cookies.get('apice.logger.[' + name + '].level');
		if (!levelCookie) {
			this.#level = $scope.globalLevel;
		} else {
			this.#level = $scope.levels[levelCookie];
			if (!this.#level) {
				this.#level = $scope.globalLevel;
			}
		}
	}

	/** Obtains or sets the log level defined for the logger instance */
	level() {
		if (arguments.length !== 0) {
			var levelInfo = $scope.levels[arguments[0]];
			if (!levelInfo) {
				throw new Error('apice.logger.invalid_level[' + arguments[0] + ']');
			}
			this.#level = levelInfo;
			cookies.set('apice.logger.[' + this.#name + '].level', arguments[0], 1800);
		}
		return this.#level.label;
	}

	/**
	 * Internal implementation that writes a log entry
	 * @param level Level of the log message to print
	 * @param message Message to print into the log entry. To include placerholders set the index of the element
	 *          (starting with 0) between curvy brackets. Example: "the values is {0}"
	 * @param values Values to replace the placeholders plus any element to include as details. Any element that
	 *          does not match the placeholders will be included as log details
	 */
	#writeLog(level, message, ...values) {
		if (this.#level.value >= level.value) {
			if (typeof (message) !== 'string') {
				message = JSON.stringify(message);
			} else if (values && values.length > 0) {
				const replaced = util.placeholders(message, ...values);
				message = replaced.output;
				values = replaced.unbind;
			}
			console.log('%c[' + level.label + '][' + this.#name + ']: ' + message, ...['color: ' + level.color, ...values]);
		}
	}

	/**
	 * Prints a FATAL log message
	 * @param message Message to print into the log entry. To include placerholders set the index of the element
	 *          (starting with 0) between curvy brackets. Example: "the values is {0}"
	 * @param values Values to replace the placeholders plus any element to include as details. Any element that
	 *          does not match the placeholders will be included as log details
	 */
	fatal(message, ...values) {
		this.#writeLog($scope.levels.fatal, message, ...values);
	}

	/**
	 * Prints an ERROR log message
	 * @param message Message to print into the log entry. To include placerholders set the index of the element
	 *          (starting with 0) between curvy brackets. Example: "the values is {0}"
	 * @param values Values to replace the placeholders plus any element to include as details. Any element that
	 *          does not match the placeholders will be included as log details
	 */
	error(message, ...values) {
		this.#writeLog($scope.levels.error, message, ...values);
	}

	/**
	 * Prints a WARNING log message
	 * @param message Message to print into the log entry. To include placerholders set the index of the element
	 *          (starting with 0) between curvy brackets. Example: "the values is {0}"
	 * @param values Values to replace the placeholders plus any element to include as details. Any element that
	 *          does not match the placeholders will be included as log details
	 */
	warn(message, ...values) {
		this.#writeLog($scope.levels.warn, message, ...values);
	}

	/**
	 * Prints an INFO log message
	 * @param message Message to print into the log entry. To include placerholders set the index of the element
	 *          (starting with 0) between curvy brackets. Example: "the values is {0}"
	 * @param values Values to replace the placeholders plus any element to include as details. Any element that
	 *          does not match the placeholders will be included as log details
	 */
	info(message, ...values) {
		this.#writeLog($scope.levels.info, message, ...values);
	}

	/**
	 * Prints a DEBUG log message
	 * @param message Message to print into the log entry. To include placerholders set the index of the element
	 *          (starting with 0) between curvy brackets. Example: "the values is {0}"
	 * @param values Values to replace the placeholders plus any element to include as details. Any element that
	 *          does not match the placeholders will be included as log details
	 */
	debug(message, ...values) {
		this.#writeLog($scope.levels.debug, message, ...values);
	}

	/**
	 * Prints a TRACE log message
	 * @param message Message to print into the log entry. To include placerholders set the index of the element
	 *          (starting with 0) between curvy brackets. Example: "the values is {0}"
	 * @param values Values to replace the placeholders plus any element to include as details. Any element that
	 *          does not match the placeholders will be included as log details
	 */
	trace(message, ...values) {
		this.#writeLog($scope.levels.trace, message, ...values);
	}
}

/**
 * Obtains the instance of a specific logger or creates a new one if that does not exist
 * @param name Logger name or identifier
 * @returns Logger instance
 */
$module.getLogger = function (name) {
	if (!name) {
		name = 'system';
	}
	if (!$scope.loggers[name]) {
		$scope.loggers[name] = new Logger(name);
	}
	return $scope.loggers[name];
};

/** Gets or sets the default level defined for the loggers */
$module.level = function () {
	if (arguments.length === 1) {
		const levelInfo = $scope.levels[arguments[0]];
		if (!levelInfo) {
			throw new Error('apice.logger.invalid_level[' + arguments[0] + ']');
		}
		$scope.globalLevel = levelInfo;
		cookies.set('apice.logger.level', arguments[0], 1800);
		for (var logName in $scope.loggers) {
			var logger = $scope.loggers[logName];
			logger.level(arguments[0]);
		}
	} else if (arguments.length === 2) {
		const logger = $module.getLogger(arguments[0]);
		logger.level(arguments[1]);
		return logger.level();
	}
	return $scope.globalLevel?.label;
};

export default $module;