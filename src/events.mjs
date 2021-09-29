/**
 * Allows to register a callback to be executed when the document ready state has been reached
 * @param callback Function to be executed when the document ready is reached
 */
function documentReady(callback) {
	if (document.readyState === "complete") {
		callback();
	} else if (typeof (document.addEventListener) === 'function') {
		document.addEventListener('DOMContentLoaded', callback, false);
	} else if (typeof (document.attachEvent) === 'function') {
		document.attachEvent("onreadystatechange", function () {
			if (document.readyState === "complete") {
				callback();
			}
		});
	}
};

/**
 * Adds an event listener to a specific element
 * @param target Reference to the DOM element that will receive the event listener
 * @param eventName Name of the event, for example 'click'
 * @param listener Listener function to be executed when the event is triggered
 */
 function addListener (target, eventName, listener) {
	if (!target) {
		throw new Error('apice.util.event.invalid_target');
	} else if (!eventName || typeof (eventName) !== 'string') {
		throw new Error('apice.util.event.invalid_event_name');
	} else if (typeof (listener) !== 'function') {
		return;
	}
	if (typeof (target.addEventListener) === 'function') {
		target.addEventListener(eventName, listener, false);
	} else if (typeof (target.attachEvent) === 'function') {
		target.attachEvent('on' + eventName, listener);
	}
};

export default { addListener, documentReady };