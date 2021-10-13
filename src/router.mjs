import events from './events.mjs';
import element from './element.mjs';
import fragment from './fragment.mjs';
import errorHandler from './errorHandler.mjs';
import logging from './logging.mjs';

const $moduleName = 'apice.router';
const logger = logging.getLogger($moduleName);
const $module = {};

const $scope = {};
// contains all the routes registered
$scope.routes = [];
// holds the reference to the default route if any
$scope.defaultRoute = null;
// holds the reference to the route that will be served when there is not default route and a pattern is not matched
$scope.notFoundRoute = null;
// Reference to the target element that receives the routing of fragments
$scope.target = null;


/**
 * Internal control method that is invoked when the hash receives a change
 * @param eventName String with the name of the event that triggered the change (mostly for tracing purposes)
 */
function onHashChange(eventName) {
	logger.debug('Hash change triggered. event={0}', eventName);
	const hash = $module.hash();
	var route = $module.match(hash);
	if (route) {
		logger.debug('Serving route. pattern={0}', route.pattern);
	} else if ($scope.defaultRoute && (!hash || !$scope.notFoundRoute)) {
		if (hash) {
			logger.warn('Route not found. Serving default hash={0}', hash);
		} else {
			logger.debug('No hash found. Serving default router');
		}
		route = $scope.defaultRoute;
	} else if ($scope.notFoundRoute) {
		// TODO: define actions when there is no matching route and default hash is not defined
		logger.warn('Route not found. Using no-found default routing. hash={0}', hash);
		route = $scope.notFoundRoute;
	} else {
		errorHandler.render({
			module: $moduleName,
			message: 'The requested resource was not found: ' + hash,
			code: 'apice.router.no_matching_no_default'
		}); // FIXME: should we use a selector like $scope.target
		return;
	}
	route.serve(hash);
}

/**
 * Class representing a hash that allows to parse it and evaluate its parts
 */
class RouteHash {
	#pattern
	#parts
	#parameters

	constructor(pattern) {
		if (!pattern || typeof (pattern) !== 'string') {
			throw Error('apice.router.hah.invalid_pattern');
		}
		this.#pattern = pattern;
		this.#parse();
	}

	#parse() {
		this.#parts = [];
		this.#parameters = [];
		var parts = this.#pattern.split('/');
		for (var idx = 0; idx < parts.length; idx++) {
			var section = parts[idx];
			if (section.startsWith(':')) {
				this.#parameters.push(section.substr(1));
			}
			this.#parts.push(section);
		}
	}

	get pattern() {
		return this.#pattern;
	}

	get count() {
		return this.#parts.length;
	}

	get hasParameters() {
		return this.#parameters.length > 0;
	}
}

/**
 * Class representing a route definition
 */
class ApiceRoute {
	// Object representing the router hash pattern
	#routeHash
	// Action to be executed when the route is executed
	#action

	/**
	 * Creates an object with the router specifications
	 * @param pattern String with the hash pattern to use for this router
	 * @param action Function with the action to execute or reference to a fragment or a controller
	 */
	constructor(pattern, action) {
		if (!pattern || typeof (pattern) !== 'string') {
			throw Error('apice.route.constructor.invalid_route_value');
		} else if (!action) {
			throw Error('apice.route.constructor.missing_route_action');
		}
		this.#routeHash = new RouteHash(pattern);
		this.#action = action;
	}

	get pattern() {
		return this.#routeHash.pattern;
	}

	asDefault() {
		$scope.defaultRoute = this;
	}

	asNotFound() {
		$scope.notFoundRoute = this;
	}

	match(hash) {
		if (!this.#routeHash.hasParameters) {
			return hash === this.#routeHash.pattern;
		}
		// QUEDE AQUI IMPLEMENTANDO EL ALGORITMO DE HASHING
		return false;
	}

	/**
	 * Serves the route represented by the current instance, triggering its associated action
	 */
	serve(hash) {
		try {
			if (typeof (this.#action) === 'function') {
				logger.trace('Serving routing from function. pattern={0}', this.pattern);
				this.#action(hash);
			} else if (typeof (this.#action) === 'string') {
				logger.trace('Serving routing from fragment ID. pattern={0} fragment={1}', this.pattern, this.#action);
				fragment(this.#action).render($scope.target);
			} else if (fragment.isFragment(this.#action)) {
				logger.trace('Serving routing from fragment instance. pattern={0}', this.pattern);
				this.#action.render($scope.target);
			} else if (typeof (this.#action.serve) === 'function') {
				logger.trace('Serving routing from serviced instance. pattern={0}', this.pattern);
				this.#action.serve();
			} else {
				throw Error(`apice.router.invalid_action[${this.pattern}]`);
			}
		} catch (ex) {
			errorHandler.render({
				module: $moduleName,
				message: 'An error has occurred trying to serve the resource. Please contact technical support without closing this screen',
				code: `apice.router.serve_error[${this.pattern}]`,
				cause: ex
			}, $scope.target);
		}
	}
}

/**
 * Registers a route into the routing engine
 * @param pattern String with the path used for the route
 * @param action Function to be invoked when the route is executed, or reference to the fragment or the controller to be executed
 */
$module.register = function (pattern, action) {
	logger.debug('Registering route. pattern=' + pattern);
	var route = new ApiceRoute(pattern, action);
	$scope.routes.push(route);
	return route;
};

/**
 * Search for the route that matches a specific route value
 * @param route String with the route path to match
 * @returns Route instance that matches the path or null if nothing matches the path
 */
$module.match = function (hash) {
	if (!hash || typeof (hash) !== 'string') {
		return null;
	}
	for (var idx = 0; idx < $scope.routes.length; idx++) {
		var route = $scope.routes[idx];
		if (route.match(hash) === true) {
			return route;
		}
	}
	return null;
};

/**
 * Obtains the current hash
 * @returns Current hash value in the location
 */
$module.hash = function () {
	var hash = window.location.hash;
	if (hash.startsWith('#')) {
		hash = hash.substr(1);
	}
	return hash;
};

/**
 * Initializes the execution of the routing engine
 */
$module.start = function () {
	logger.debug('Starting Apice router');
	events.addListener(window, 'hashchange', () => {
		onHashChange('hashchange');
	});
	//util.events.addListener(window, 'popstate', () => {
	//    onHashChange('popstate');
	//    return false;
	//});
	events.documentReady(() => {
		onHashChange('routerstart');
	});
	return $module;
};

/**
 * Gets or sets the target element that will receive the content of any route associated with a fragment.  This method
 * is polymorphic. When no argument is provided returns the current target.
 * @param selector String with the selector of the target or reference to the DOM element that will receive the
 *                  content of any route that contains a fragment. When this is not provided the method will return
 *                  the selected target.
 * @returns When no selector is provided this method returns the defined target.
 */
$module.target = function () {
	// getter mode
	if (arguments.length === 0) {
		return $scope.target;
	}
	// setter mode
	var selector = arguments[0];
	if (!selector) {
		$scope.target = null;
	} else {
		$scope.target = element(selector);
		if (!$scope.target) {
			logger.error(`apice.router.target_notfound[${selector}]`);
		}
	}
	if (!$scope.target) {
		logger.info('Using default routing target container');
		var container = document.getElementById('apc-router-container');
		if (!container) {
			container = document.createElement('div');
			container.id = 'apc-router-container';
			document.body.appendChild(container);
		}
		$scope.target = element(container);
	}
	return $module;
};

export default $module;