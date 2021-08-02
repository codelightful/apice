const $moduleName = 'alux.controller';
const $scope = {};
// contains all the controllers registered, indexed by name
$scope.controllers = {};

import http from './http.mjs';
import errorHandler from './errorHandler.mjs'; 
import log from './logging.mjs';
const logger = log.getLogger($moduleName);

/** Allows to obtain a specific controller */
const $module = function (name) {
    if (typeof(name) === 'string') {
        var controller = $scope.controllers[name];
        if(!controller) {
            throw new Error('alux.controller.unknown_controller[' + name + ']');
        }
        return controller;
    }
};

/** Class with the implementation of a controller object */
class AluxController {
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

    declare(impl) {
        if(typeof(impl) !== 'function') {
            throw new Error('alux.controller.declare.invalid_implementation[' + this.#name + ']');
        }
        this.#impl = impl;
    }

    /**
     * Serves the controller
     * @returns Promise fullfilled once the controller has been executed
     */
    serve() {
        var implType = typeof(this.#impl);
        if(implType === 'function') {
            logger.debug('Serving controller. controller=' + this.#name);
            return new Promise((resolve, reject) => {
                try {
                    this.#impl();
                    resolve();
                } catch(err) {
                    reject(errorHandler.create({
                        module: $moduleName, 
                        cause: err,
                        code: 'alux.controller.serve.implementation_error[' + this.#name + ']'  
                    }));
                }
            });
        } else if(implType === 'string') {
            logger.debug('Loading controller. controller=' + this.#name);
            return new Promise((resolve, reject) => {
                http.loadScript(this.#impl).then(() => {
                    setTimeout(() => {
                        $module(this.#name).serve().then(resolve).catch(reject);
                    }, 0);
                }).catch((err) => {
                    reject(errorHandler.create({
                        module: $moduleName, 
                        cause: err,
                        code: 'alux.controller.load_script_error[' + this.#name + ']'  
                    }));
                });
            });
        }
        return Promise.reject(errorHandler.create({
            module: $moduleName, 
            code: 'alux.controller.bad_implementation[' + this.#name + ']'  
        }))
    }
}

/**
 * Registers a new controller
 * @param name Controller name
 * @param impl String with the controller implementation source or function with the behavior to execute
 */
$module.register = function (name, impl) {
    logger.debug('Registering controller. controller=' + name);
    var controller = new AluxController(name, impl);
    $scope.controllers[name] = controller;
    return controller;
};

/**
 * Declares the implementation of a specific controller
 * @param name Name of the controller to declare
 * @param impl Implementation to declare
 */
$module.declare = function(name, impl) {
    logger.debug('Declaring controller. controller=' + name);
    var controller = $scope.controllers[name];
    if(!controller) {
        throw new Error('alux.controller.declare.unknown_controller[' + name +']');
    }
    controller.declare(impl);
};

/**
 * Allows to determine if a particular object is a controller
 * @param obj Object instance to evaluate
 * @returns Boolean value to determine if the object is a controller or not
 */
 $module.isController = function(obj) {
    return (obj && obj instanceof AluxController);
};

export default $module;