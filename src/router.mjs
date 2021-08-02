const $module = {};
const $moduleName = 'alux.router';
const $scope = {};
// contains all the routes registered
$scope.routes = [];
// holds the reference to the default route if any
$scope.defaultRoute = null;

import util from './util.mjs';
import errorHandler from './errorHandler.mjs';
import log from './logging.mjs';
const logger = log.getLogger($moduleName);

/**
 * Internal control method that is invoked when the hash receives a change
 * @param eventName String with the name of the event that triggered the change (mostly for tracing purposes)
 */
function onHashChange(eventName) {
    logger.debug('Hash change triggered. event=' + eventName);
    const hash = $module.hash();
    const route = $module.match(hash);
    if(route) {
        logger.debug('Serving route: ' + route.pattern);
    } else if(!$scope.defaultRoute) {
        // TODO: define actions when there is no matching route and default hash is not defined
        errorHandler.render({ module: $moduleName, code: 'alux.router.no_matching_no_default'});
    } else {
        logger.debug('Serving default route: ' + $scope.defaultRoute.pattern);
        $scope.defaultRoute.serve();
    }
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
};

/**
 * Class representing a hash that allows to parse it and evaluate its parts
 */
class RouteHash {
    #pattern
    #parts

    constructor(pattern) {
        if (!pattern || typeof (pattern) !== 'string') {
            throw Error('alux.router.hah.invalid_pattern');
        }
        this.#pattern = pattern;
        this.#parts = this.#pattern.split('/');
    }

    get pattern() {
        return this.#pattern;
    }

    get count() {
        return this.#parts.length;
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

    serve() {
        if(typeof(this.#action) === 'function') {
            try {
                this.#action();
            } catch(err) {
                logger.error('alux.router.action_error[' + this.pattern + ']', err);
            }
        } else if(typeof(this.#action.serve) === 'function') {
            this.#action.serve();
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
$module.match = function (route) {
    if (!route || typeof (route) !== 'string') {
        return null;
    }
    // QUEDE AQUI IMPLEMENTANDO ESTE METODO
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

export default $module;