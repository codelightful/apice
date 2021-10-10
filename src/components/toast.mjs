import logging from '../logging.mjs';

const $moduleName = 'apice.ui.toast';
const $module = {};
const $scope = {};
const logger = logging.getLogger($moduleName);

// contains the default titles
$scope.defaultTitle = {};
$scope.defaultTitle['error'] = 'Attention!';
$scope.defaultTitle['warn'] = 'Warning!';
$scope.defaultTitle['info'] = 'Information';
$scope.defaultTitle['success'] = 'Sucess!';

/** Internal method with the logic to create the top container that will hold all the toasts */
function createToastContainer() {
	var container = document.getElementById('apc-toast-container');
	if (!container) {
		container = document.createElement('div');
		container.id = 'apc-toast-container';
		document.body.appendChild(container);
	}
	return container;
}

/** Class implementing the toast component */
class ApiceToast {
	// string with the toast type (error, warn, info, success)
	#style;
	// string with the toast title (or boolean false to remove the title area)
	#title;
	// string with the toast body or message
	#body;
	// icon to use
	#icon;
	// top container representing the toast box
	#box;
	// integer with the number of seconds before dismissing the toast or boolean false to avoid user dismissal or boolean true to enable manual dismissal
	#dismiss;

	constructor(specs) {
		this.#style = specs.style;
		this.#title = { text: specs.title };
		this.#body = { text: specs.message };
		this.#icon = { resource: specs.icon };
		this.#dismiss = specs.dismiss;
		this.#render();
	}

	/** Allows to obtain the title of the toast (if any) */
	get title() {
		if (!this.#title.text && this.#title.text !== false) {
			return $scope.defaultTitle[this.#style];
		}
		return this.#title.text;
	}

	/** Returns the body message of the toast */
	get message() {
		return this.#body.text;
	}

	/** Internal method to render (or refresh) the title area */
	#renderTitle() {
		var text = this.title;
		if (!text) {
			if (this.#title.box) {
				this.#title.box.style.display = 'none';
			}
			return;
		}
		if (!this.#title.box) {
			this.#title.box = document.createElement('div');
			this.#title.box.className = 'apc-header';
			this.#box.appendChild(this.#title.box);
		}
		this.#title.box.style.display = 'block';
		this.#title.box.innerHTML = text;
	}

	/** Internal method to render (or refresh) the body area */
	#renderBody() {
		if (!this.#body.box) {
			this.#body.box = document.createElement('div');
			this.#body.box.className = 'apc-body';
			this.#box.appendChild(this.#body.box);
		}
		this.#body.box.innerHTML = this.message;
	}

	/** Internal method to render (or refresh) the icon */
	#renderIcon() {
		if (!this.#icon.resource) {
			if (this.#icon.box) {
				this.#icon.box.style.display = 'none';
			}
			return;
		}
		if (!this.#icon.box) {
			this.#icon.box = document.createElement('div');
			this.#icon.box.className = 'apc-icon';
			this.#box.appendChild(this.#icon.box);
		}
		if (this.#icon.resource === true) {
			this.#icon.box.innerHTML = '&nbsp;';
		} else {
			// TODO: implement
		}
	}

	/** Internal method to create the visual representation of the toast */
	#render() {
		if (!this.#box) {
			this.#box = document.createElement('div');
		}
		this.#box.className = 'apc-toast apc-' + this.#style;
		this.#renderIcon();
		this.#renderTitle();
		this.#renderBody();
		if (typeof (this.#dismiss) === 'number') {
			setTimeout(() => {
				this.dismiss();
			}, this.#dismiss * 1000);
		} else if (this.#dismiss === true) {
			this.#box.onclick = () => {
				this.dismiss();
			};
			this.#box.className += ' apc-clickable';
		}
	}

	/** Closes the toast */
	dismiss() {
		if (this.#box) {
			this.#box.style.animationName = 'bounce-out';
			setTimeout(() => {
				this.#box.parentElement.removeChild(this.#box);
				this.#box = null;
			}, 500);
		}
	}

	/** Adds the toast to a specific container */
	appendTo(container) {
		container.insertBefore(this.#box, container.firstChild);
	}
}

/**
 * Internal method with the common behavior to render a toast
 * @param style String with the toast style (error, warn, info, success)
 * @param args Arguments to create the toast. It can be:
 * 			- An object containing the following attributes:
 * 				* title: String with the title text or boolean false to omit the use of title
 * 				* message: String with the message
 * 				* icon: String with the icon to use or boolean false to remove the icon
 * 				* dismiss: Number of seconds to dismiss the message, or boolean true to make it manually dismissable or false to avoid manual dismiss
 * 			- A string with the toast message (the default title and icon will be used and the toast will be manually dismissable)
 * 			- A string with the title (or boolean false to avoid the title) and the toast message
 */
function renderToast(style, ...args) {
	const specs = { style: style, title: null, message: null, icon: true, dismiss: true };
	if (args.length === 1) {
		if (typeof (args[0]) === 'object') {
			Object.assign(specs, args[0]);
		} else {
			specs.message = args[0];
		}
	} else {
		specs.title = args[0];
		specs.message = args[1];
		specs.dismiss = args[2] ?? true;
	}
	if (!specs.message) {
		logger.warn('A toast has been requested without message. The toast has been ignored');
		return;
	}
	const toast = new ApiceToast(specs);
	const container = createToastContainer();
	toast.appendTo(container);
}

/** Creates an error toast */
$module.error = function () {
	renderToast('error', ...arguments);
};

/** Creates a warning toast */
$module.warn = function () {
	renderToast('warn', ...arguments);
};

/** Creates an information toast */
$module.info = function () {
	renderToast('info', ...arguments);
};

/** Creates a success toast */
$module.success = function () {
	renderToast('success', ...arguments);
};

/** Defines the maximum number of toast to use */
$module.setMax = function () {
	// TODO: implement
};

export default $module;
