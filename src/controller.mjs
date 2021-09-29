import http from './http.mjs';
import errorHandler from './errorHandler.mjs';
import log from './logging.mjs';

const $moduleName = 'apc.controller';
const logger = log.getLogger($moduleName);
const $scope = {};
// contains all the controllers registered, indexed by name
$scope.controllers = {};

/** Allows to obtain a specific controller */
const $module = function (name) {
	if (typeof (name) === 'string') {
		var controller = $scope.controllers[name];
		if (!controller) {
			throw Error(`apice.controller.unknown_controller[${name}]`);
		}
		return controller;
	}
};

/** Class with the implementation of a controller object */
class ApiceController {
	// name to identify the controller
	#name;
	// controller implementation source
	#impl;
	constructor(name, impl) {
		this.#name = name;
		this.#impl = impl;
	}

	/** Allows to obtain the name of the controller */
	get name() {
		return this.#name;
	}

	/** Declares the implementation of this controller */
	declare(impl) {
		if (typeof (impl) !== 'function') {
			throw new Error(`apice.controller.declare.invalid_implementation[${this.#name}]`);
		}
		this.#impl = impl;
	}

	/** Internal method to run the controller implementation */
	#runImplementation() {
		logger.debug('Serving controller. controller={0}', this.#name);
		return new Promise((resolve, reject) => {
			try {
				this.#impl();
				resolve();
			} catch (err) {
				reject(errorHandler.create({
					module: $moduleName,
					cause: err,
					code: `apice.controller.serve.implementation_error[${this.#name}]`
				}));
			}
		});
	}

	/** Internal method to load the implementation script (usually invoked the first time and only once) */
	#loadImplementation() {
		logger.debug('Loading controller. controller={0}', this.#name);
		return new Promise((resolve, reject) => {
			http.loadScript(this.#impl).then(() => {
				// wraps the controller execution in a timeout to ensure it is executed after the effective declaration
				setTimeout(() => {
					// if the implementation is still a string it means that the controller was never loaded
					if (typeof (this.#impl) === 'string') {
						reject(`apice.controller.serve.undeclared[${this.#name}]`);
					} else {
						this.#runImplementation().then(resolve).catch(reject);
					}
				}, 0);
			}).catch((err) => {
				reject(errorHandler.create({
					module: $moduleName,
					cause: err,
					code: `apice.controller.load_script_error[${this.#name}]`
				}));
			});
		});
	}

	/**
	 * Serves the controller executing its implementation
	 * @returns Promise fullfilled once the controller has been executed
	 */
	serve() {
		var implType = typeof (this.#impl);
		if (implType === 'function') {
			return this.#runImplementation();
		} else if (implType === 'string') {
			return this.#loadImplementation();
		}
		return Promise.reject(errorHandler.create({
			module: $moduleName,
			code: `apice.controller.bad_implementation[${this.#name}]`
		}))
	}
}

/**
 * Registers a new controller
 * @param name Controller name
 * @param impl String with the controller implementation source or function with the behavior to execute
 */
$module.register = function (name, impl) {
	logger.debug('Registering controller. controller={0)', name);
	var controller = new ApiceController(name, impl);
	$scope.controllers[name] = controller;
	return controller;
};

/**
 * Declares the implementation of a specific controller
 * @param name Name of the controller to declare
 * @param impl Implementation to declare
 */
$module.declare = function (name, impl) {
	logger.debug('Declaring controller. controller={0}', name);
	var controller = $scope.controllers[name];
	if (!controller) {
		throw Error(`apice.controller.declare.unknown_controller[${name}]`);
	}
	controller.declare(impl);
};

/**
 * Allows to determine if a particular object is a controller
 * @param obj Object instance to evaluate
 * @returns Boolean value to determine if the object is a controller or not
 */
$module.isController = function (obj) {
	return (obj && obj instanceof ApiceController);
};

export default $module;