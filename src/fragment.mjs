import http from './http.mjs';
import errorHandler from './errorHandler.mjs';
import controller from './controller.mjs';
import element from './element.mjs';
import log from './logging.mjs';

const $moduleName = 'apice.fragment';
const logger = log.getLogger($moduleName);
const $scope = {};
$scope.fragments = {};

/** Class with the implementation of a fragment object */
class ApiceFragment {
	// name to identify the fragment
	#name;
	// url with the content source
	#source;
	// name of the controller used by the fragment
	#controller;

	constructor(name, source, controller) {
		this.#name = name;
		this.#source = source;
		this.#controller = controller;
	}

	/** Allows to obtain the name of the fragment */
	get name() {
		return this.#name;
	}

	/** Internal method to execute the controller associated with the fragment */
	#runController() {
		if (!this.#controller) {
			return Promise.resolve();
		}
		return new Promise((resolve, reject) => {
			var controllerType = typeof (this.#controller);
			if (controllerType === 'function') {
				logger.debug('Serving fragment controller function. fragment={0}', this.#name);
				try {
					this.#controller();
					resolve();
				} catch (ex) {
					reject(errorHandler.create({
						module: $moduleName,
						cause: ex,
						code: `apice.fragment.controller_function_error[${this.#name}]`
					}));
				}
			} else if (controllerType === 'string') {
				logger.debug('Serving fragment controller. fragment={0} controller={1}', this.#name, this.#controller);
				controller(this.#controller).serve().then(resolve).catch((ex) => {
					reject(errorHandler.create({
						module: $moduleName,
						cause: ex,
						code: `apice.fragment.controller_serve_error[${this.name}]`
					}));
				});
			}
		});
	}

	/**
	 * Renders the fragment content in a specific placeholder
	 * @param selector String with the selector to identify the target placeholder or reference to the DOM element. If no selector
	 * 			is provided the content will be rendered in the body by default.
	 * @returns Promise to take actions depending on the result of the rendering. The promise receives a context that contains
	 *          two attributes:
	 *          - target: Reference to the DOM element that will receive the fragment content
	 *          - response: Fragment content received as part of tha AJAX call.  This can be replaced by a different output.
	 */
	render(selector) {
		if (!selector) {
			selector = document.body;
		}
		var target = element(selector);
		if (!target) {
			return Promise.reject(errorHandler.create({
				module: $moduleName,
				code: `apice.fragment.render.target_not_found[${selector}]`
			}));
		}
		logger.debug('Serving fragment. fragment={0}', this.#name);
		return new Promise((resolve, reject) => {
			http.request(this.#source, { method: 'GET' }).then((response) => {
				// TODO: add a response interceptor
				target.content(response.content);
				// NOTE: this timeout is required to execute the controller AFTER the content has been rendered 
				setTimeout(() => {
					this.#runController().then(resolve).catch(reject);
				}, 0);
			}).catch((ex) => {
				reject(errorHandler.create({
					module: $moduleName,
					message: 'An error has occurred trying to load the content',
					cause: ex,
					code: `apice.fragment.render_error[${this.name}]`
				}));
			});
		});
	}
}

/** Allows to obtain a specific fragment */
const $module = function (name) {
	if (typeof (name) === 'string') {
		var fragment = $scope.fragments[name];
		if (!fragment) {
			throw new Error(`apice.fragment.unknown_fragment[${name}]`);
		}
		return fragment;
	}
};

/**
 * Registers a new fragment
 * @param name Fragment name
 * @param source Fragment content
 * @param controller Optional name of the controller associated with the fragment
 */
$module.register = function (name, source, controller) {
	logger.debug('Registering fragment. fragment={0}', name);
	var fragment = new ApiceFragment(name, source, controller);
	$scope.fragments[name] = fragment;
	return fragment;
};

/**
 * Allows to determine if a particular object is a fragment
 * @param obj Object instance to evaluate
 * @returns Boolean value to determine if the object is a fragment or not
 */
$module.isFragment = function (obj) {
	return (obj && obj instanceof ApiceFragment);
};

export default $module;