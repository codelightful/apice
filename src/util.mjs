const $module = {};
const $scope = {};

// NOTE: this module is a low level module and should not import any other module

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
			this.#element.innerHTML = '';
		} else if (typeof (content) === 'string') {
			this.#element.innerHTML = content;
		} else if (content instanceof AluxElement) {
			this.#element.innerHTML = content.html();
		}
		return this;
	}

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
 * @param selector String with the selector to obtain the DOM element or reference to the DOM element
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
	if (typeof(target.addEventListener) === 'function') {
		target.addEventListener(eventName, fnc, false);
	} else if (typeof(target.attachEvent) === 'function') {
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