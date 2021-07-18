/*
Alux Logger Module
v1.0.0
*/
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

import cookies from './cookies.mjs';
var levelCookie = cookies.get('alux.logger.level');
if(!levelCookie) {
    $scope.globalLevel = $scope.levels.warn;
} else {
    $scope.globalLevel = $scope.levels[levelCookie];
    if(!$scope.globalLevel) {
        $scope.globalLevel = $scope.levels.warn;
    }
}

/**
 * Internal log implementation
 * @param logName Name of the logger to print
 * @param currentLevel Log level defined for the logger
 * @param level Level of the log message to print
 * @param message Message to print
 * @param details Details to add
 */
function log(logName, currentLevel, level, message, ...details) {
    if(currentLevel.value >= level.value) {
        console.log('%c[' + level.label + '][' + logName + ']: ' + message, ...['color: ' + level.color, ...details]);
    }
};

/** Represents a specific logger */
class Logger {
    // holds the name or identigier of the current logger
    #name;
    // log level defined for the logger instance
    #level;

    constructor(name) {
        this.#name = name;
        var levelCookie = cookies.get('alux.logger.[' + name + '].level');
        if(!levelCookie) {
            this.#level = $scope.globalLevel;
        } else {
            this.#level = $scope.levels[levelCookie];
            if(!this.#level) {
                this.#level = $scope.globalLevel;
            }       
        }
    }

    /** Obtains or sets the log level defined for the logger instance */
    level() {
        if(arguments.length !== 0) {
            var levelInfo = $scope.levels[arguments[0]];
            if(!levelInfo) {
                throw new Error('alux.logger.invalid_level[' + arguments[0] + ']');
            }
            this.#level = levelInfo;
            cookies.set('alux.logger.[' + this.#name + '].level', arguments[0], 1800);
        }
        return this.#level.label;
    }

    /**
     * Prints a FATAL log message
     * @param message Message to print
     * @param details Objects to add as details to the logger
     */
    fatal(message, ...details) {
        log(this.#name, this.#level, $scope.levels.fatal, message, ...details);
    }

    /**
     * Prints an ERROR log message
     * @param message Message to print
     * @param details Objects to add as details to the logger
     */
    error(message, ...details) {
        log(this.#name, this.#level, $scope.levels.error, message, ...details);
    }

    /**
     * Prints a WARNING log message
     * @param message Message to print
     * @param details Objects to add as details to the logger
     */
    warn(message, ...details) {
        log(this.#name, this.#level, $scope.levels.warn, message, ...details);
    }

    /**
     * Prints an INFO log message
     * @param message Message to print
     * @param details Objects to add as details to the logger
     */
    info(message, ...details) {
        log(this.#name, this.#level, $scope.levels.info, message, ...details);
    }

    /**
     * Prints a DEBUG log message
     * @param message Message to print
     * @param details Objects to add as details to the logger
     */
    debug(message, ...details) {
        log(this.#name, this.#level, $scope.levels.debug, message, ...details);
    }

    /**
     * Prints a TRACE log message
     * @param message Message to print
     * @param details Objects to add as details to the logger
     */
    trace(message, ...details) {
        log(this.#name, this.#level, $scope.levels.trace, message, ...details);
    }
}

/**
 * Obtains the instance of a specific logger or creates a new one if that does not exist
 * @param name Logger name or identifier
 * @returns Logger instance
 */
$module.getLogger = function(name) {
    if(!$scope.loggers[name]) {
        $scope.loggers[name] = new Logger(name);
    }
    return $scope.loggers[name];
};

/** Gets or sets the default level defined for the loggers */
$module.level = function() {
    if(arguments.length === 1) {
        const levelInfo = $scope.levels[arguments[0]];
        if(!levelInfo) {
            throw new Error('alux.logger.invalid_level[' + arguments[0] + ']');
        }
        $scope.globalLevel = levelInfo;
        cookies.set('alux.logger.level', arguments[0], 1800);
        for(var logName in $scope.loggers) {
            var logger = $scope.loggers[logName];
            logger.level(arguments[0]);
        }
    } else if(arguments.length === 2) {
        const logger = $module.getLogger(arguments[0]);
        logger.level(arguments[1]);
        return logger.level();
    }
    return $scope.globalLevel?.label;
};

export default $module;