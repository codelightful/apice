import random from '../random.mjs';
import events from '../events.mjs';
import element from '../element.mjs';
import logging from '../logging.mjs';
import mask from './mask.mjs';

const $moduleName = 'apice.ui.dialog';
const $module = {};
const logger = logging.getLogger($moduleName);
const $scope = {};
// holds the current open dialog (if any) or null if there is no open dialog
$scope.current = null;
// holds the queue of dialogs
$scope.queue = [];
// will hold the dialog top container
$scope.container = null;
// will hold the dialog header container
$scope.header = null;
// will hold the dialog body container
$scope.body = null;
// will hold the dialog footer container
$scope.footer = null;
// indicator of the dialog visual status 1=open 0=closed
$scope.status = 0;

$scope.titles = {};
$scope.titles['error'] = 'Atention!';
$scope.titles['warn'] = 'Warning!';
$scope.titles['info'] = 'Information';
$scope.titles['success'] = 'Success!';


/** Removes a dialog instance from the queue */
function removeFromQueue(dialog) {
	if (!dialog) {
		return;
	}
	for (let idx = 0; idx < $scope.queue.length; idx++) {
		const entry = $scope.queue[idx];
		if (entry.dialog === dialog) {
			$scope.queue.splice(idx, 1);
			logger.debug('The dialog has been removed. id={0}', dialog.id);
			return;
		}
	}
	logger.warn('The dialog instance could not be removed from the queue since it was not found. id={0}', dialog.id);
}

/**
 * Internal utility method to create a dialog part (header, body, footer)
 * @param container Container to add the dialog part to it
 * @param className String with the css class to set into the dialog part
 */
function createDialogPart(container, className) {
	const elem = document.createElement('div');
	elem.className = className;
	container.append(elem);
	return element(elem);
}

/** Create the dialog singleton instance */
function createDialog() {
	if (!$scope.container) {
		logger.debug('Creating the dialog container');
		let container = document.getElementById('apice-dialog');
		if (!container) {
			container = document.createElement('div');
			container.id = 'apice-dialog';
			container.className = 'apc-dialog';
			document.body.appendChild(container);
		}
		container = element(container);
		$scope.container = container;
		$scope.header = createDialogPart(container, 'apc-header');
		$scope.body = createDialogPart(container, 'apc-body');
		$scope.footer = createDialogPart(container, 'apc-footer apc-button-bar');
	}
}

/** Creates and renders the HTMLElements to represent a dialog */
function openDialog(style, render) {
	if ($scope.status === 1) {
		logger.debug('Dialog container is already visible');
		return Promise.resolve();
	}
	$scope.status = 1;
	createDialog();
	logger.debug('Displaying the dialog container');
	render();
	const promises = [];
	promises[0] = mask.show();
	promises[1] = new Promise(resolve => {
		events.waitAnimation($scope.container, 'apc-dialog apc-open apc-' + style, resolve);
	});
	return Promise.all(promises);
}

/** Remove the visual elements associated with the dialog */
function closeDialog() {
	if ($scope.status === 0) {
		logger.debug('Dialog container is already closed');
		return Promise.resolve();
	}
	$scope.status = 0;
	logger.debug('Closing the dialog container');
	const promises = [];
	promises[0] = mask.hide();
	promises[1] = new Promise(resolve => {
		events.waitAnimation($scope.container, 'apc-dialog apc-closed', function() {
			$scope.header.content('');
			$scope.body.content('');
			$scope.footer.content('');
			resolve();
		});
	});
	return Promise.all(promises);
}

/**
 * Opens the next dialog from the queue (if any)
 * @returns Boolean value to determine if another dialog was in the queue
 */
function nextDialog() {
	if ($scope.queue.length === 0) {
		logger.debug('No more dialogs in the queue');
		return false;
	}
	logger.debug('Opening the next dialog from the queue');
	const entry = $scope.queue.shift();
	entry.dialog.open().then(entry.resolve).catch(entry.reject);
	return true;
}

/**
 * Internal utility method that triggers all the listeners in an event list
 * @param events Array with the events to execute 
 */
function triggerEvents(events) {
	for(let idx=0; idx < events.length; idx++) {
		const listener = events[idx];
		try {
			listener();
		} catch(ex) {
			logger.error('An error has occurred trying to execute an event listener', ex);
			// TODO: should we use the error handler
		}
	}
}

/**
 * Internal method to render a button spec inside the dialog footer area
 * @param dialog Reference to the dialog instance
 * @param specs Button specifications
 */
function renderButton(dialog, specs) {
	if(!specs) {
		return;
	} else if(specs === 'close') {
		specs = { label: 'Close', close: true };
	}
	const button = document.createElement('button');
	button.className = 'apc-button';
	button.innerHTML = specs.label;
	if(typeof(specs.action) === 'function') {
		button.onclick = () => {
			if(specs.action() !== false && specs.close !== false) {
				dialog.close();
			}
		};
	} else if(specs.close) {
		button.onclick = () => {
			dialog.close();
		};
	}
	$scope.footer.append(button);
}

/** Class implementing the dialog components */
class ApiceDialog {
	// Holds the identifier for this instance
	#id;
	// String with the type of dialog (error, warn, info, success)
	#style;
	// Object with all the binded events for this object
	#events;
	// Contains the title defined for this dialog
	#title;
	// Contains the body message for this dialog
	#body;
	// Array with the button specification used for this dialog
	#buttons;

	constructor(specs) {
		if (!specs.id) {
			specs.id = `dialog_${random.tinyId()}`;
		}
		this.#id = specs.id;
		this.#style = specs.style;
		this.#title = specs.title;
		this.#body = specs.body;
		this.#buttons = [];
		this.#events = {};
		this.#events.close = [];
	}

	/** Allows to obtain the identifier for the current instance */
	get id() {
		return this.#id;
	}

	/** Obtains the effective title applicable for this instance */
	get title() {
		if(!this.#title) {
			return $scope.titles[this.#style];
		}
		return this.#title;
	}

	/**
	 * Opens the dialog
	 * @returns A promise to be fulfilled after the dialog is opened
	 */
	open() {
		if ($scope.current === this) {
			logger.debug('The dialog instance is already opened. id={0}', this.id);
			return Promise.resolve();
		} else if ($scope.current) {
			logger.debug('Another dialog instance is opened. The current dialog is queued. id={0}', this.id);
			return new Promise((resolve, reject) => {
				$scope.queue.push({ dialog: this, resolve: resolve, reject: reject });
			});
		}
		logger.debug('Opening dialog instance. id={0}', this.id);
		$scope.current = this;
		return openDialog(this.#style, () => {
			$scope.header.content(this.title);
			$scope.body.content(this.#body);
			$scope.footer.content('');
			for(let bdx=0; bdx < this.#buttons.length; bdx++) {
				const buttonSpec = this.#buttons[bdx];
				renderButton(this, buttonSpec);
			}
		});
	}

	/**
	 * Closes the dialog
	 * @returns A promise to be fulfilled after the dialog is closed
	 */
	close() {
		// if the current open dialog is not the current instance then we just need to remove
		// it from the queue
		if ($scope.current !== this) {
			logger.debug('The dialog cannot be closed because it is not opened. Removing it from the queue. id={0}', this.id);
			removeFromQueue(this);
			return Promise.resolve();
		}
		logger.debug('Closing dialog. id={0}', this.id);
		$scope.current = null;
		return closeDialog().then(() => {
			triggerEvents(this.#events.close);
			nextDialog();
		});
	}

	/** Adds a listener to be executed after the dialog has been closed */
	onClose(listener) {
		if (typeof (listener) === 'function') {
			this.#events.close.push(listener);
		}
	}

	/**
	 * Adds a button to the current dialog
	 * @param specs Button specification or string with the keyword 'close' to add a close button.
	 * 			The button specification will use the following attributes:
	 * 			- label: String with the button label or content
	 * 			- close: Boolean value to define if the button should close the dialog after the action
	 * 			- action: Function to be executed when the button is pressed. If the button should close
	 * 				the dialog after the action this method can return a boolean false to prevent it.
	 */
	addButton(specs) {
		if(specs) {
			this.#buttons.push(specs);
		}
		return this;
	}
}

/**
 * Internal utility method to create a dialog
 * @param style String with the dialog style (error, warn, info, success)
 * @param specs Strign with the dialog content or specifications to create the dialog
 * @returns Diaog instance
 */
function createApiceDialog(style, specs) {
	if (typeof (specs) === 'string') {
		specs = { body: specs };
	} else if (!specs) {
		specs = {};
	}
	specs.style = style;
	return new ApiceDialog(specs);
}

/**
 * Creates a new error dialog instance
 * @param specs String with the dialog content or specifications to create the dialog: { title: 'string', body: 'string' }
 * @returns Dialog instance
 */
$module.error = function (specs) {
	return createApiceDialog('error', specs);
};

/**
 * Creates a new warn dialog instance
 * @param specs String with the dialog content or specifications to create the dialog: { title: 'string', body: 'string' }
 * @returns Dialog instance
 */
$module.warn = function (specs) {
	return createApiceDialog('warn', specs);
};

/**
 * Creates a new info dialog instance
 * @param specs String with the dialog content or specifications to create the dialog: { title: 'string', body: 'string' }
 * @returns Dialog instance
 */
$module.info = function (specs) {
	return createApiceDialog('info', specs);
};

/**
 * Creates a new success dialog instance
 * @param specs String with the dialog content or specifications to create the dialog: { title: 'string', body: 'string' }
 * @returns Dialog instance
 */
$module.success = function (specs) {
	return createApiceDialog('success', specs);
};

export default $module;
