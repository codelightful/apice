// NOTE: this module is a low level module and should not import any other module
const $module = {};
const $scope = {};

/** Parses a string HTML content and returns its content or null if it is not HTML content */
function parseHTML(content) {
	if (!content || typeof (content) !== 'string') {
		return null;
	}
	const holder = document.createElement("div");
	holder.innerHTML = content;
	return [...holder.childNodes];
}

//-----------------------------------------------------------------------------
// ALUX ELEMENT
//-----------------------------------------------------------------------------
/** Hold the singleton instances of unique DOM elements (body, window) */
$scope.singletons = {};

/** Class wrapping a DOM element and simplifying some actions on it */
class AluxElement {
	#element;
	constructor(element) {
		this.#element = element;
	}

	/** Allows to obtain the number of effective DOM elements covered by this instance */
	get count() {
		if (!this.#element) {
			return 0;
		} else if (Array.isArray(this.#element)) {
			return this.#element.length;
		}
		return 1;
	}

	/** Allows to obtain the base DOM element */
	get element() {
		return this.#element;
	}

	/**
	 * Allows to obtain or set the HTML content of an element.  If no paramaters are provided the html content will
	 * be returned.  When a string argument is provided, the HTML content of the element will be set with the string.
	 * When a AluxElement is provided, then the HTML content will be extracted from it.  If a reference to a DOM element
	 * is provided, then it will be set as the content of the wrapped element.
	 * @returns When no argument are provided returns the HTML element otherwise returns the AluxElement instance
	 */
	html() {
		if (arguments.length === 0) {
			if (!this.#element) {
				return null;
			}
			// TODO: what to do if we have an array of elements
			return this.#element.innerHTML;
		}
		if (!this.#element) {
			return this;
		}
		var content = arguments[0];
		if (!content) {
			content = '';
		} else if (content instanceof AluxElement) {
			content = content.html();
		}
		this.#element.innerHTML = content;
		return this;
	}

	/**
	 * Internal method to parse content and create an array of its HTML DOM elements
	 * @param content Content to parse
	 * @returns Array with HTML DOM elements
	 */
	#parseContent(content) {
		if (content instanceof AluxElement) {
			content = [content.element];
		} else if (content instanceof Element) {
			content = [content];
		} else {
			content = parseHTML(content);
		}
		return content;
	}

	/**
	 * Adds an HTML content at the beggining of this content
	 * @returns This element instance
	 */
	prepend() {
		if (!this.#element) {
			return this;
		} else if (arguments.length === 0) {
			return this;
		} else if (arguments.length > 1) {
			for (var idx = arguments.length - 1; idx >= 0; idx--) {
				this.prepend(arguments[idx]);
			}
			return this;
		}
		// TODO: what happen if element is an array
		const content = this.#parseContent(arguments[0]);
		if (content) {
			const currentBeginning = this.#element.firstChild;
			content.map(current => { this.#element.insertBefore(current, currentBeginning); });
		}
		return this;
	}

	/**
	 * Appends content to the end of the current element
	 * @returns This element instance
	 */
	append() {
		if (!this.#element) {
			return this;
		} else if (arguments.length === 0) {
			return this;
		} else if (arguments.length > 1) {
			for (var idx = 0; idx < arguments.length; idx++) {
				this.append(arguments[idx]);
			}
			return this;
		}
		// TODO: what happen if element is an array
		const content = this.#parseContent(arguments[0]);
		if (content) {
			content.map(current => { this.#element.appendChild(current); });
		}
		return this;
	}

	/**
	 * Bind a specific ebent with a function
	 * @param eventName String with the event name
	 * @param fnc Function to bind
	 * @returns This element instance
	 */
	on(eventName, fnc) {
		if (!eventName) {
			throw new Error('alux.element.on.no_event_name');
		}
		if (this.#element && typeof (fnc) === 'function') {
			$module.events.addListener(this.#element, eventName, fnc);
		}
		return this;
	}
}

/**
 * Allows to obtain an Alux element as a wrapper for a particular DOM element
 * @param selector String with the selector to obtain the DOM element or reference to the DOM element. If it is not
 * 			provided then a reference to the body will be used.
 * @returns An AluxElement wrapping the element. If the element does not exist an empty AluxElement will be returned.
 */
$module.element = function (selector) {
	if (!selector || selector === 'body') {
		if (!$scope.singletons.body) {
			$scope.singletons.body = new AluxElement(document.body);
		}
		return $scope.singletons.body;
	} else if (selector === 'window') {
		if (!$scope.singletons.window) {
			$scope.singletons.window = new AluxElement(window);
		}
		return $scope.singletons.window;
	} else if (selector instanceof AluxElement) {
		return selector;
	}
	const selectorType = typeof (selector);
	if (selectorType === 'string') {
		var element = document.querySelector(selector);
		return new AluxElement(element);
	} else if (selectorType === 'object') {
		// TODO evaluate it is really a DOM element
		return new AluxElement(selector);
	}
	return new AluxElement();
};

//-----------------------------------------------------------------------------
// EVENT HANDLING
//-----------------------------------------------------------------------------
$module.events = {};
// placeholders to maintain references to event listeners and callbacks
$scope.events = {};
// contains all the callbacks registered to be executed once the ready status is reached
$scope.events.ready = {
	completed: false,
	listeners: []
};
// allows to determine if the checkready state has been executed
$scope.events.checkReadyState = false;

function onEvent(eventName, fnc) {
	const eventHolder = $scope.events[eventName];
	if (!eventHolder) {
		throw new Error('alux.events.unknown_event[' + eventName + ']');
	} else if (typeof (fnc) !== 'function') {
		throw new Error('alux.events.invalid_listener');
	} else if (eventHolder.completed) {
		fnc();
	} else {
		eventHolder.listeners.push(fnc);
	}
}

/**
 * Allows to register a callback to be executed when the document ready state has been reached
 * @param fnc Function to be executed when the document ready is reached
 */
$module.events.onReady = function (fnc) {
	onEvent('ready', fnc);
	if ($scope.events.checkReadyState) {
		return;
	}
	$scope.events.checkReadyState = true;
	const onDocumentReady = () => {
		$scope.events.ready.completed = true;
		if ($scope.events.ready.listeners.length > 0) {
			$scope.events.ready.listeners.map((handler) => {
				handler();
			});
		}
	};
	if (document.readyState === "complete") {
		onDocumentReady();
	} else if (typeof (document.addEventListener) === 'function') {
		document.addEventListener('DOMContentLoaded', onDocumentReady, false);
	} else if (typeof (document.attachEvent) === 'function') {
		document.attachEvent("onreadystatechange", function () {
			if (document.readyState === "complete") {
				onDocumentReady();
			}
		});
	}
};

/**
 * Adds an event listener to a specific element
 * @param target Reference to the DOM element that will receive the event listener
 * @param eventName Name of the event, for example 'click'
 * @param fnc Function to be executed when the event is triggered
 */
$module.events.addListener = function (target, eventName, fnc) {
	if (!target) {
		throw new Error('alux.util.event.invalid_target');
	} else if (!eventName || typeof (eventName) !== 'string') {
		throw new Error('alux.util.event.invalid_event_name');
	} else if (typeof (fnc) !== 'function') {
		return;
	}
	if (typeof (target.addEventListener) === 'function') {
		target.addEventListener(eventName, fnc, false);
	} else if (typeof (target.attachEvent) === 'function') {
		target.attachEvent('on' + eventName, fnc);
	}
};

//-----------------------------------------------------------------------------
// OBJECT EVALUATION
//-----------------------------------------------------------------------------
/**
 * Allows to determine if a specific object instance is a promise or not
 * @param target Object instance to evaluate
 * @returns Boolean value to determine if the object instance is a promise or not
 */
$module.isPromise = function (target) {
	return (target instanceof Promise);
};

//-----------------------------------------------------------------------------
// STRIING MANIPULATION
//-----------------------------------------------------------------------------
/** Trims a string by removing leading and trailing white spaces  */
$module.trim = function (text) {
	return text.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

// regular expression to extract the message placeholders
const holderRegex = /\{(\d+)\}/g;

/**
 * Replaces all the placeholders in a string
 * @param input String containing the placeholders to replace. Each placeholder will be identified
 * 			with a numeric index (starting at zero) between curly brackets.
 * @param values Array with the values to replace the placeholders.
 * @returns Object containing the output text and the unbinded values. It has the shape: { output: 'string', unbind: array };
 */
$module.placeholders = function (input, ...values) {
	const result = { output: input, unbind: values };
	if (typeof (input) !== 'string') {
		return result;
	}
	const indexControl = {};
	const holders = input.matchAll(holderRegex);
	for (let holder of holders) {
		const source = holder[1];
		if (!source || indexControl[source]) {
			continue;
		}
		indexControl[source] = true;
		const regex = new RegExp('\\{' + source + '\\}', 'g');
		const value = values[source];
		result.unbind[source] = null;
		result.output = result.output.replace(regex, value);
	}
	// removes the elements that have been used
	result.unbind = result.unbind.filter((element) => {
		return element !== undefined && element !== null;
	});
	return result;
}

//-----------------------------------------------------------------------------
// RANDOM
//-----------------------------------------------------------------------------
$module.random = {};

/** Creates a random tiny identified composed by 4 alphanumeric characters */
$module.random.tinyId = function () {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

/** Creates a random short identified composed by 8 alphanumeric characters */
$module.random.shortId = function () {
	return $module.random.tinyId() + $module.random.tinyId();
};

/** Creates a random values simulating a global global unique identifier */
$module.random.guid = function () {
	return $module.random.shortId()
		+ '-' + $module.random.shortId()
		+ '-' + $module.random.shortId()
		+ '-' + $module.random.shortId()
		+ $module.random.shortId();
};

export default $module;