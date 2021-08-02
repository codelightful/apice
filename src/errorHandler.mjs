const $module = {};
import log from './logging.mjs';
import util from './util.mjs';

/** Wrapper that allows to control the action around an error */
class ErrorHandler {
    // String with the name of the module or the layer that produced the error. This is used to obtain the logger
    #module
    // String with the message to show to the user (if any). When there is no specific message, then a generic error message will be shown
    #message
    // The cause of the error (if any)
    #cause
    // The code of the error (if any). This wil be printed to the log as a hint, along with the cause (if any)
    #code
    // The unique error number used to correlate any error message in the UI with the entries in the log
    #guid

    constructor(specs) {
        this.#guid = util.random.guid();
        this.#message = specs.message;
        this.#cause = specs.cause;
        this.#module = specs.module;
        this.#code = specs.code ?? 'alux.error_handler';
    }

    /** Allows to obtain the unique value that identify this error occurrence */
    get guid() {
        return this.#guid;
    }

    /** Obtains the message if there is any */
    get message() {
        return this.#message??'An error has occurred. Please contact the technical support without closing this screen.';
    }

    /** Obtains the cause if there is any */
    get cause() {
        return this.#cause;
    }

    /** Obtains the error code if any */
    get code() {
        return this.#code;
    }

    /** Creates an error entry with the details about the error */
    log() {
        const logger = log.getLogger(this.#module);
        // TODO: improve this algorithm
        if(typeof(this.#cause) === 'string') {
            logger.error('[' + this.#guid + ']\n-> ' + this.#code + '\n-> ' + this.#cause);
        } else if(this.#cause) {
            if(this.#cause instanceof ErrorHandler) {
                if(this.#cause.code && this.#cause.cause) {
                    logger.error('[' + this.#guid + ']\n-> ' + this.#code + '\n-> ' + this.#cause.code + '\n->', this.#cause.cause);
                } else if(this.#cause.code) {
                    logger.error('[' + this.#guid + ']\n-> ' + this.#code + '\n-> ' + this.#cause.code);
                } else if(this.#cause.cause) {
                    logger.error('[' + this.#guid + ']\n-> ' + this.#code + '\n->', this.#cause.cause);
                }
                // TODO: handle nested error handlers
            } else if(this.#cause instanceof HttpError) {
                logger.error('[' + this.#guid + ']\n-> ' + this.#code + '\n-> http-error[' + this.#cause.code + ']');
            } else {
                logger.error('[' + this.#guid + ']\n-> ' + this.#code + '\n->', this.#cause);
            }
        } else {
            logger.error('[' + this.#guid + ']\n-> ' + this.#code);
        }
    }

    /**
     * Renders a visual hint to inform the user about the error
     * @param selector String with the selector to render the error on it or reference to a DOM element
     */
    render(selector) {
        var target = util.element(selector);
        this.log();
        target.html('<div class="badge badge-error">\
            <div class="header">Atention!</div>\
            <div class="content">' + this.message + '</div>\
            <div class="details">' + this.#guid + '</div>\
        </div>');
    }
}

/**
 * Creates an object to wrap an error and allow to take actions with it
 * @param specs Object with the specifications to create the error handler.  The values are:
 *      - module: String with the name of the module that produces the error (required)
 *      - message: String with any message rendered to the end user (optional)
 *      - cause: Reference to the root cause that creates the error condition (optional if the cause is provided)
 *      - code: String with the error code (optional if a code is provided)
 * @returns Error hanlder instance
 */
$module.create = function(specs) {
    return new ErrorHandler(specs);
};

/**
 * Renders a visual hint to report an error. This method is polymorphic and can receive:
 * 1) A selector and a error object: The error will be rendered inside the element matching the selector.
 *    The selector can be a string or a reference to a DOM element.
 *    The error can be a JavaScript error, an ErrorHandler reference or a specification object (see below)
 * 2) A error object: The error will be rendered in the body.
 *    The error can be a JavaScript error, an ErrorHandler reference or a specification object (see below)
 * When the error is a specification object please follow the structured defined in the create method of this module
 */
$module.render = function() {
    var err = null;
    var selector = null;
    if(arguments.length === 1) {
        err = arguments[0];
    } else if(arguments.length === 2) {
        selector = arguments[0];
        err = arguments[1];
    }
    if(!err) {
        return;
    } else if(!(err instanceof ErrorHandler)) {
        err = new ErrorHandler(err);
    }
    err.render(selector);
};

/** Represents an HTTP error */
class HttpError {
    /** Code of the HTTP error */
    #code;
    
    /**
     * Creates a new HttpError instance with a specific error code
     * @param code HTTP error code
     */
    constructor(code) {
        this.#code = code;
    }

    /** Code with the type of error */
    get type() {
        return 'http';
    }

    /** Allows to obtain the HTTP code associated with the error represented by this instance */
    get code() {
        return this.#code;
    }
}

/** Creates an HTTP error */
$module.createHttpError = function(httpCode) {
    return new HttpError(httpCode);
};

export default $module;