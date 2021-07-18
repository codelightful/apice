const $moduleName = 'fragment';
const $scope = {};
$scope.fragments = {};

import http from './http.mjs';
import logger from './logger.mjs';
import errorHandler from './errorHandler.mjs'; 
const log = logger.getLogger($moduleName);

/** Class with the implementation of a fragment object */
class Fragment {
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

    /**
     * Serves the fragment rendering its content in a specific placeholder
     * @param selector String with the selector to identify the target placeholder
     * @returns Promise to take actions depending on the result of the rendering
     */
    serve(selector) {
        var oThis = this;
        var target = null;
        if(!selector || selector === 'body') {
            target = document.body;
        } else if(typeof(selector) === 'string') {
            target = document.querySelector(selector);
        }
        if(!target) {
            return Promise.reject(errorHandler.create({
                module: $moduleName, 
                code: 'alux.fragment.serve.target_not_found[' + selector + ']'
            }));
        }
        return new Promise((resolve, reject) => {
            http.request(this.#source, { method: 'GET' }).then(function(response) {
                var processed = resolve(response);
                if(processed) {
                    target.innerHTML = processed;
                } else {
                    target.innerHTML = response;
                }
            }).catch(function(err) {
                reject(errorHandler.create({
                    module: $moduleName, 
                    code: 'alux.fragment.serve_error[' + oThis.name + ']', 
                    cause: err 
                }));
            });
        });
    }
}

/** Allows to obtain a specific fragment */
const $module = function (name) {
    if (typeof(name) === 'string') {
        var fragment = $scope.fragments[name];
        if(!fragment) {
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
    log.debug('Registering fragment. name=' + name);
    var fragment = new Fragment(name, source, controller);
    $scope.fragments[name] = fragment;
    return fragment;
};

export default $module;