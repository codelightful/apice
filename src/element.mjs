import events from './events.mjs';

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

/** Class wrapping one or more DOM elements and simplifying some actions on it */
class ApiceElement {
}

/** Class wrapping one DOM element and simplifying some actions on it */
class SingleElement extends ApiceElement {
	/** Reference to the DOM element being wrapped */
	#element;

	constructor(value) {
		super();
		this.#element = value;
	}

	/** Allows to determine if the instance is wrapping a valid DOM element */
	get isValid() {
		return !!this.#element;
	}

	/** Allows to obtain the ID of the element */
	get id() {
		if (!this.#element) {
			return null;
		}
		return this.#element.id;
	}

	/** Allows to interact with the wrapped DOM element (if any) */
	each(callback) {
		if (typeof (callback) === 'function' && this.#element) {
			callback(this.#element);
		}
		return this;
	}

	/**
	 * Allows to obtain or set the HTML content of an element.  If no paramaters are provided the html content will
	 * be returned.  When a string argument is provided, the HTML content of the element will be set with the string.
	 * When a ApiceElement is provided, then the HTML content will be extracted from it.  If a reference to a DOM element
	 * is provided, then it will be set as the content of the wrapped element.
	 * @returns When no argument are provided returns the HTML element otherwise returns the ApiceElement instance
	 */
	content() {
		if (arguments.length === 0) {
			if (!this.#element) {
				return null;
			}
			return this.#element.innerHTML;
		}
		if (this.#element) {
			var content = arguments[0];
			if (!content) {
				this.#element.innerHTML = '';
			} else if (isDOMElement(content)) {
				this.#element.innerHTML = '';
				this.#element.appendChild(content);
			} else if (content instanceof ApiceElement) {
				this.#element.innerHTML = '';
				content.each(child => {
					this.#element.append(child);
				});
			} else {
				this.#element.innerHTML = content;
			}
		}
		return this;
	}

	/**
	 * Appends content to the end of the current element
	 * @returns This element instance
	 */
	append() {
		if (this.#element && arguments.length > 0) {
			if (arguments.length > 1) {
				for (var idx = 0; idx < arguments.length; idx++) {
					this.append(arguments[idx]);
				}
			} else {
				var content = arguments[0];
				if (content instanceof ApiceElement) {
					content.each(item => {
						this.#element.appendChild(item);
					});
				} else if (typeof (content) === 'string') {
					content = parseHTML(content);
					for (var idx = 0; idx < content.length; idx++) {
						this.#element.appendChild(content[idx]);
					}
				} else if (isDOMElement(content)) {
					this.#element.appendChild(content);
				} else if (content instanceof NodeList) {
					for (var idx = 0; idx < content.length; idx++) {
						const node = content[idx];
						this.#element.appendChild(node);
					}
				}
			}
		}
		return this;
	}

	/**
	 * Adds an HTML content at the beggining of this content
	 * @returns This element instance
	 */
	prepend() {
		if (this.#element && arguments.length > 0) {
			if (arguments.length > 1) {
				for (var idx = 0; idx < arguments.length; idx++) {
					this.prepend(arguments[idx]);
				}
			} else {
				const first = this.#element.firstChild;
				var content = arguments[0];
				if (content instanceof ApiceElement) {
					content.each(item => {
						this.#element.insertBefore(item, first);
					});
				} else if (typeof (content) === 'string') {
					content = parseHTML(content);
					for (var idx = 0; idx < content.length; idx++) {
						this.#element.insertBefore(content[idx], first);
					}
				} else if (isDOMElement(content)) {
					this.#element.insertBefore(content, first);
				} else if (content instanceof NodeList) {
					for (var idx = 0; idx < content.length; idx++) {
						const node = content[idx];
						this.#element.insertBefore(node, first);
					}
				}
			}
		}
		return this;
	}

	/**
	 * Bind a specific event with a function
	 * @param eventName String with the event name
	 * @param fnc Function to bind
	 * @returns This element instance
	 */
	on(eventName, fnc) {
		if (!eventName) {
			throw new Error('apice.element.on.no_event_name');
		}
		if (this.#element && typeof (fnc) === 'function') {
			events.addListener(this.#element, eventName, fnc);
		}
		return this;
	}

	/** 
	 * Invokes the click event (when no argument is provided) or binds an action to the click 
	 * event (receiving a function as the argument) 
	 */
	click() {
		if (arguments.length === 0) {
			// TODO: implement
			return this;
		}
		if (typeof (arguments[0]) !== 'function') {
			return this;
		}
		this.on('click', arguments[0]);
		return this;
	}

	/**
	 * Gets all the child elements that matches a specific selector
	 * @param selector String with the selector
	 * @returns Apice element wrapping the matches
	 */
	select(selector) {
		if (!selector || typeof (selector) !== 'string') {
			return null;
		}
		return applySelector(this.#element, selector);
	}
}

/**
 * Class wrapping two or more elements
 */
class MultipleElements extends ApiceElement {
	/** Array with the wrapped elements */
	#elements;

	constructor() {
		super();
		this.#elements = [];
	}

	/**
	 * Adds an element to this instance
	 * @param element 
	 * @returns 
	 */
	add(element) {
		if (element) {
			this.#elements.push(element);
		}
		return this;
	}

	/**
	 * Internal method that invokes a function on all the elements wrapped by this instance
	 * @param functionName String with the name of the function to invoke
	 * @param args Arguments to call the function
	 * @returns Object wiith the array of return values
	 */
	#nodeCall(functionName, args) {
		const returnValue = [];
		for (var idx = 0; idx < this.#elements.length; idx++) {
			const node = this.#elements[idx];
			const targetFunction = node[functionName];
			if (typeof (targetFunction) === 'function') {
				try {
					const result = targetFunction.apply(node, args);
					if (Array.isArray(result)) {
						returnValue.push(...result);
					} else {
						returnValue.push(result);
					}
				} catch (ex) {
					console.log(`itaca.element.node_call[${functionName}]`, ex);
				}
			}

		}
		return returnValue;
	}

	/** See SingleElement */
	each() {
		this.#nodeCall('each', arguments);
		return this;
	}

	/** See SingleElement */
	content() {
		if (arguments.length === 0) {
			return this.#nodeCall('content', arguments);
		}
		this.#nodeCall('content', arguments);
		return this;
	}

	/** See SingleElement */
	append() {
		this.#nodeCall('append', arguments);
		return this;
	}

	/** See SingleElement */
	prepend() {
		this.#nodeCall('prepend', arguments);
		return this;
	}

	/** See SingleElement */
	on() {
		this.#nodeCall('on', arguments);
		return this;
	}

	/** See SingleElement */
	click() {
		this.#nodeCall('click', arguments);
		return this;
	}

	/** See SingleElement */
	select() {
		this.#nodeCall('select', arguments);
		return this;
	}
}

/** Allows to determine if a specific object instance is a DOM element */
function isDOMElement(obj) {
	return (obj && typeof (obj) === 'object' && obj.nodeType === 1);
}

/**
 * Internal function to create Web Elements according to a selector query
 * @param root Element to use as the root to run the selector
 * @param selector String with the selector
 * @returns Instance of an Web Element wrapping the matched elements or null if there is no match
 */
function applySelector(root, selector) {
	const elements = root.querySelectorAll(selector);
	// selector does not match DOM elements
	if (elements.length === 0) {
		return null;
	}
	// selector matches a single DOM element 
	else if (elements.length === 1) {
		return new SingleElement(elements[0]);
	}
	// selector matches multiple DOM elements
	const nodes = new MultipleElements();
	for (var idx = 0; idx < elements.length; idx++) {
		const node = elements[idx];
		nodes.add(new SingleElement(node));
	}
	return nodes;
}

/**
 * Allows to obtain an Web element as a wrapper for a particular DOM element
 * @param selector String with the selector to obtain the DOM element or reference to the DOM element. If it is not
 * 			provided then a reference to the body will be used.
 * @returns An ApiceElement wrapping the element. If the selector does not match a valid element the method will return null.
 */
const $module = function (selector) {
	if (!selector) {
		return null;
	} else if (selector === 'body' || selector === document.body) {
		if (!$scope.bodySingleton) {
			$scope.bodySingleton = new SingleElement(document.body);
		}
		return $scope.bodySingleton;
	} else if (typeof (selector) === 'string') {
		return applySelector(document, selector);
	} else if (selector instanceof ApiceElement) {
		return selector;
	} else if (isDOMElement(selector)) {
		return new SingleElement(selector);
	}
	return null;
};

/**
 * Appends a source element into aother target element
 * @param target String with the target selector to find the element, or reference to the DOM element, or Apice element
 * @param source String with the source selector to find the element, or reference to the DOM element, or Apice element
 */
$module.append = function (target, source) {
	if (!target || !source) {
		return;
	} else if (source === 'body' || source === document.body) {
		throw Error('apice.element.append.source_cannot_be_body');
	}
	if (typeof (source) === 'string') {
		const stringStart = source.charAt(0);
		if (stringStart === '#' || stringStart === '.' || stringStart === '[') {
			const sourceElement = document.querySelector(source);
			if (!sourceElement) {
				throw Error(`apice.element.append.unknown_source[${source}]`);
			}
			source = sourceElement;
		}
	}
	const targetElement = $module(target);
	if (!targetElement) {
		throw Error(`apice.element.append.unknown_target[${target}]`);
	}
	targetElement.append(source);
};

export default $module;