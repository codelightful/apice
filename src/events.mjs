/**
 * Allows to register a callback to be executed when the document ready state has been reached
 * @param callback Function to be executed when the document ready is reached
 */
function documentReady(callback) {
	if (document.readyState === 'complete') {
		callback();
	} else if (typeof (document.addEventListener) === 'function') {
		document.addEventListener('DOMContentLoaded', callback, false);
	} else if (typeof (document.attachEvent) === 'function') {
		document.attachEvent('onreadystatechange', function () {
			if (document.readyState === 'complete') {
				callback();
			}
		});
	}
}

/**
 * Adds an event listener to a specific element
 * @param target Reference to the DOM element that will receive the event listener
 * @param eventName Name of the event, for example 'click'
 * @param listener Listener function to be executed when the event is triggered
 */
function addListener(target, eventName, listener) {
	if (!target) {
		throw new Error('apice.util.event.add.invalid_target');
	} else if (!eventName || typeof (eventName) !== 'string') {
		throw new Error('apice.util.event.add.invalid_event_name');
	} else if (typeof (listener) !== 'function') {
		return;
	}
	// if the target is an Apice element then we need to interact with the inner HTML element
	if (typeof (target.each) === 'function') {
		target.each(item => {
			addListener(item, eventName, listener);
		});
	} else if (typeof (target.addEventListener) === 'function') {
		target.addEventListener(eventName, listener, false);
	} else if (typeof (target.attachEvent) === 'function') {
		target.attachEvent('on' + eventName, listener);
	}
}

/**
 * Removes an event listener from a specific element
 * @param target Reference to the DOM element to remove the listener from it
 * @param eventName Name of the event, for example 'click'
 * @param listener Listener function to remove
 */
function removeListener(target, eventName, listener) {
	if (!target) {
		throw new Error('apice.util.event.remove.invalid_target');
	} else if (!eventName || typeof (eventName) !== 'string') {
		throw new Error('apice.util.event.remove.invalid_event_name');
	} else if (typeof (listener) !== 'function') {
		return;
	}
	// if the target is an Apice element then we need to interact with the inner HTML element
	if (typeof (target.each) === 'function') {
		target.each(item => {
			removeListener(item, eventName, listener);
		});
	} else if (typeof (target.removeEventListener) === 'function') {
		target.removeEventListener(eventName, listener);
	} else if (typeof (target.detachEvent) === 'function') {
		target.detachEvent('on' + eventName, listener);
	}
}

/**
 * Internal method to assign an animation class to an element and invoke a callback when is completed
 * @param target Reference to the HTMLElement to animate
 * @param animation String with the animation name
 * @param callback Function to invoked when the animation is completed 
 */
function waitAnimation(target, animation, callback) {
	const listener = function () {
		removeListener(target, 'animationend', listener);
		callback();
	};
	addListener(target, 'animationend', listener);
	// NOTE: we need to determine if the target is an Apice element but the element library should not be imported here
	// hence we use the method css to determine if is possible to set the css class
	if (typeof (target.setClass) === 'function') {
		target.setClass(animation);
	} else {
		target.className = animation;
	}
}

export default { addListener, removeListener, documentReady, waitAnimation };