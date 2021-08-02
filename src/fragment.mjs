const $moduleName = 'alux.fragment';
const $scope = {};
$scope.fragments = {};

import http from './http.mjs';
import errorHandler from './errorHandler.mjs';
import controller from './controller.mjs';
import util from './util.mjs';
import log from './logging.mjs';
const logger = log.getLogger($moduleName);

/** Class with the implementation of a fragment object */
class AluxFragment {
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

    #runController() {
        return new Promise((resolve, reject) => {
            if (!this.#controller) {
                resolve();
            } else {
                setTimeout(() => {
                    var controllerType = typeof (this.#controller);
                    if (controllerType === 'function') {
                        logger.debug('Serving fragment controller function. fragment=' + this.#name);
                        try {
                            this.#controller();
                            resolve();
                        } catch (err) {
                            reject(errorHandler.create({
                                module: $moduleName,
                                cause: err,
                                code: 'alux.fragment.controller_implementation_error[' + this.#name + ']'
                            }));
                        }
                    } else if (controllerType === 'string') {
                        logger.debug('Serving fragment controller. fragment=' + this.#name + ' controller=' + this.#controller);
                        controller(this.#controller).serve().then(resolve).catch((err) => {
                            reject(errorHandler.create({
                                module: $moduleName,
                                cause: err,
                                code: 'alux.fragment.controller_serve_error[' + this.name + ']'
                            }));
                        });
                    }
                });
            }
        });
    }

    /**
     * Serves the fragment rendering its content in a specific placeholder
     * @param selector String with the selector to identify the target placeholder or reference to the DOM element
     * @param handled Boolean value to determine if a promise should be returned to handle the actions after serving the promise and the errors.
     *          By default it is false.  When is not handled the framework will take care of the errors in an standard way by rendering an
     *          error badge into the target selector.
     * @returns Promise to take actions depending on the result of the rendering. The promise receives a context that contains
     *          two attributes:
     *          - target: Reference to the DOM element that will receive the fragment content
     *          - response: Fragment content received as part of tha AJAX call.  This can be replaced by a different output.
     */
    serve(selector, handled) {
        var target = util.element(selector);
        if (target.count === 0) {
            return Promise.reject(errorHandler.create({
                module: $moduleName,
                code: 'alux.fragment.serve.target_not_found[' + selector + ']'
            }));
        }
        logger.debug('Serving fragment. fragment=' + this.#name);
        const loadFragment = (resolve, reject) => {
            http.request(this.#source, { method: 'GET' }).then((response) => {
                // TODO: add a response interceptor
                setTimeout(() => {
                    target.html(response);
                    this.#runController().then(resolve).catch(reject);
                }, 0);
            }).catch((err) => {
                reject(errorHandler.create({
                    module: $moduleName,
                    message: 'An error has occurred trying to load a fragment of content',
                    cause: err,
                    code: 'alux.fragment.serve_error[' + this.name + ']'
                }));
            });
        }
        if(handled === true) {
            return new Promise((resolve, reject) => {
                loadFragment(resolve, reject);
            });
        }
        loadFragment(() => {
        }, (err) => {
            errorHandler.render(target, err);
        })
    }
}

/** Allows to obtain a specific fragment */
const $module = function (name) {
    if (typeof (name) === 'string') {
        var fragment = $scope.fragments[name];
        if (!fragment) {
            throw new Error('alux.fragment.unknown_fragment[' + name + ']');
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
    logger.debug('Registering fragment. fragment=' + name);
    var fragment = new AluxFragment(name, source, controller);
    $scope.fragments[name] = fragment;
    return fragment;
};

/**
 * Allows to determine if a particular object is a fragment
 * @param obj Object instance to evaluate
 * @returns Boolean value to determine if the object is a fragment or not
 */
$module.isFragment = function(obj) {
    return (obj && obj instanceof AluxFragment);
};

export default $module;