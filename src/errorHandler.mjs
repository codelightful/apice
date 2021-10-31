import logging from './logging.mjs';
import random from './random.mjs';
import element from './element.mjs';
import toast from './components/toast.mjs';

const $module = {};

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
	// boolean value to determine if the error was already rendered, to avoid double rendering when handling promise rejections
	#rendered;

	constructor(specs) {
		this.#guid = random.guid();
		this.#message = specs.message;
		this.#cause = specs.cause;
		this.#module = specs.module;
		this.#code = specs.code;
		this.#rendered = false;
	}

	/** Allows to obtain the unique value that identify this error occurrence */
	get guid() {
		return this.#guid;
	}

	/** Obtains the message if there is any */
	get message() {
		return this.#message ?? 'An error has occurred. Please contact the technical support without closing this screen.';
	}

	/** Obtains the cause if there is any */
	get cause() {
		return this.#cause;
	}

	/** Obtains the error code if any */
	get code() {
		return this.#code;
	}

	/** Internal method to create the log entry text for a specific error cause  */
	#getCauseLog(cause) {
		if (!cause) {
			return '';
		} else if (typeof (cause) === 'string') {
			return `\n-> (s) ${cause}`;
		} else if (cause instanceof Error) {
			return `\n-> (e) ${cause.stack}`;
		} else if (this.#cause instanceof ErrorHandler) {
			return `\n-> (n) ${cause.code}` + this.#getCauseLog(cause.cause);
		} else if (this.#cause instanceof HttpError) {
			return `\n-> (h) http-error[${cause.code}]`;
		}
	}

	/** Creates an error entry with the details about the error */
	log() {
		const logger = logging.getLogger(this.#module);
		let entryText = `ref=[${this.#guid}]`;
		if (this.#message) {
			entryText += `\n-> ${this.#message}`;
		}
		if (this.#code) {
			entryText += `\n-> (c) ${this.#code}`;
		}
		if (this.#cause) {
			entryText += this.#getCauseLog(this.#cause);
		}
		logger.error(entryText);
	}

	/**
	 * Renders a visual hint to inform the user about the error
	 * @param selector String with the selector to render the error on it or reference to a DOM element
	 */
	render(selector) {
		if (this.#rendered) {
			return;
		}
		this.#rendered = true;
		this.log();
		var target = element(selector);
		if (!target) {
			toast.error(`${this.message}<div>${this.#guid}</div>`);
			return;
		}
		target.content(`<div class="apc-badge apc-error">\
            <div class="apc-header">Atention!</div>\
            <div class="apc-body">${this.message}</div>\
            <div class="apc-footer">${this.#guid}</div>\
        </div>`);
	}
}

/**
 * Creates an object to wrap an error and allow to take actions with it
 * @param specs JavaScript Error instance, string with an error code or object with the specifications to create 
 *      the error handler.  If an object is used attributes are:
 *      - code: String with the error code (optional if a code is provided)
 *      - cause: Reference to the root cause that creates the error condition (optional if the cause is provided)
 *      - module: (optional) String with the name of the module that produced the error
 *      - message: (optional) String with any message rendered to the end user
 * @returns Error hanlder instance
 */
$module.create = function (specs) {
	if (!specs) {
		console.error('apice.error_handler.create.null_input');
		return null;
	}
	const specType = typeof (specs);
	if (specType === 'string') {
		specs = { code: specs };
	} else if (specs instanceof Error) {
		specs = { cause: specs };
	} else if (specType !== 'object') {
		console.error('apice.error_handler.create.invalid_input', specs);
		return null;
	}
	return new ErrorHandler(specs);
};

/**
 * Renders a visual hint to report an error
 * @param err String with the error code, JavaScript error, or an ErrorHandler reference or a specification object.
 *          When the error is a specification object please follow the structured defined in the create method of this module.
 * @param selector String with the selector to render the error on it, reference to the DOM element or null to render into the body
 */
$module.render = function (err, selector) {
	if (!err) {
		return;
	} else if (!(err instanceof ErrorHandler)) {
		err = $module.create(err);
	}
	err.render(selector);
	return err;
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
$module.createHttpError = function (httpCode) {
	return new HttpError(httpCode);
};

// adds a handler to capture any unhandled promise scenario
window.addEventListener('unhandledrejection', function (event) {
	if (event.reason instanceof ErrorHandler) {
		event.preventDefault();
		event.reason.render();
	}
});

export default $module;