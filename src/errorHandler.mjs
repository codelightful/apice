const $module = {};
import logger from './logger.mjs';
import util from './util.mjs';

/** Wrapper that allows to control the action around an error */
class ErrorHandler {
    #module;
    #rootCause;
    #code;
    #guid;
    constructor(specs) {
        this.#guid = util.random.guid();
        this.#rootCause = specs.cause;
        this.#module = specs.module;
        this.#code = specs.code ?? 'alux.error_handler';
    }

    /** Allows to obtain the unique value that identify this error occurrence */
    get guid() {
        return this.#guid;
    }

    /** Creates an error entry with the details about the error */
    log() {
        const log = logger.getLogger(this.#module);
        if(typeof(this.#rootCause) === 'string') {
            log.error('[' + this.#guid + '] ' + this.#code + ':' + this.#rootCause);
        } else if(this.#rootCause) {
            log.error('[' + this.#guid + '] ' + this.#code, this.#rootCause);
        } else {
            log.error('[' + this.#guid + '] ' + this.#code);
        }
    }

    /**
     * Renders a visual hint to inform the user about the error
     * @param selector String with the selector to render the error on it or reference to a DOM element
     */
    render(selector) {
        var target = null;
        if(!selector || selector === 'body') {
            target = document.body;
        } else if(typeof(selector) === 'string') {
            target = document.querySelector(selector);
        } else if(typeof(selector) === 'object') {
            target = selector;
        }
        this.log();
        if(target) {
            target.innerHTML = '<div class="badge badge-error">\
                <div class="header">Atention!</div>\
                <div class="content">An error has occurred</div>\
                <div class="details">' + this.#guid + '</div>\
            </div>';
        }
    }
}

/**
 * Creates an object to wrap an error and allow to take actions with it
 * @param specs Object with the specifications to create the error handler.  The values are:
 *      - module: String with the name of the module that produces the error
 *      - cause: Reference to the root cause that creates the error condition
 *      - code: Optional string with the error code
 * @returns Error hanlder instance
 */
$module.create = function(specs) {
    return new ErrorHandler(specs);
};

export default $module;