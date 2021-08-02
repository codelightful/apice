const $module = {};
const $moduleName = 'alux.router';
const $scope = {};
// contains all the routes registered
$scope.routes = [];
// holds the reference to the default route if any
$scope.defaultRoute = null;
// holds the reference to the route that will be served when there is not default route and a pattern is not matched
$scope.notFoundRoute = null;
// Reference to the target element that receives the routing of fragments
$scope.target = null;

import util from './util';
import fragment from './fragment';
import errorHandler from './errorHandler';
import log from './logging';
const logger = log.getLogger($moduleName);

/**
 * Internal control method that is invoked when the hash receives a change
 * @param eventName String with the name of the event that triggered the change (mostly for tracing purposes)
 */
function onHashChange(eventName) {
    logger.debug('Hash change triggered. event=' + eventName);
    const hash = $module.hash();
    var route = $module.match(hash);
    if (route) {
        logger.debug('Serving route: ' + route.pattern);
    } else if ($scope.defaultRoute && (!hash || !$scope.notFoundRoute)) {
        if (hash) {
            logger.warn('Route not found. Serving default hash=' + hash);
        } else {
            logger.debug('No hash found. Serving default router');
        }
        route = $scope.defaultRoute;
    } else if ($scope.notFoundRoute) {
        // TODO: define actions when there is no matching route and default hash is not defined
        logger.warn('Route not found. hash=' + hash + ' route=' + $scope.notFoundRoute.pattern);
        route = $scope.notFoundRoute;
    } else {
        errorHandler.render({
            module: $moduleName,
            message: 'The requested resource was not found: ' + hash,
            code: 'alux.router.no_matching_no_default'
        });
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
            throw Error('alux.router.hah.invalid_pattern');
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
            if(section.startsWith(':')) {
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
class AluxRoute {
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
            throw new Error('alux.route.constructor.invalid_route_value');
        } else if (!action) {
            throw new Error('alux.route.constructor.missing_route_action');
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

    serve(hash) {
        if (typeof (this.#action) === 'function') {
            try {
                this.#action(hash);
            } catch (err) {
                logger.error('alux.router.action_error[' + this.pattern + '|' + hash + ']', err);
            }
        } else if (fragment.isFragment(this.#action)) {
            this.#action.serve($scope.target);
        } else if (typeof (this.#action.serve) === 'function') {
            this.#action.serve();
        } else {
            throw Error('aux.route.invalid_action[' + this.pattern + ']');
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
    var route = new AluxRoute(pattern, action);
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
}

/**
 * Initializes the execution of the routing engine
 */
$module.start = function () {
    logger.debug('Starting Alux router');
    util.events.addListener(window, 'hashchange', () => {
        onHashChange('hashchange');
    });
    util.events.addListener(window, 'popstate', () => {
        onHashChange('popstate');
        return false;
    });
    util.events.onReady(() => {
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
    if (arguments.length === 0) {
        if (!$scope.target) {
            return document.body;
        }
        return $scope.target;
    }
    var selector = arguments[0];
    if (!selector) {
        $scope.target = document.body;
        return $module;
    }
    $scope.target = util.element(selector);
    if (!$scope.target) {
        logger.error('alux.router.target_not_found[' + selector + ']');
        $scope.target = document.body;
    }
    return $module;
};

export default $module;