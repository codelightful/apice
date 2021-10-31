import random from '../random.mjs';
import element from '../element.mjs';
import logging from '../logging.mjs';
import fragment from '../fragment.mjs';
import util from '../util.mjs';
import asynchronous from '../asynchronous.mjs';
import errorHandler from '../errorHandler.mjs';

const $moduleName = 'apice.ui.box';
const $module = {};
const logger = logging.getLogger($moduleName);

/** Internal utility method to create DIVs */
function createDiv(className, id) {
	const divElem = document.createElement('div');
	divElem.className = className;
	if (id) {
		divElem.id = id;
	}
	return divElem;
}

/** Internal method to add a closing button for a specific container */
function createClosingButton(container, box) {
	const closing = createDiv('apc-closing');
	const button = document.createElement('button');
	closing.appendChild(button);
	container.appendChild(closing);
	button.onclick = function () {
		box.close();
	};
}

/**
 * Internal method to create the box header
 * @param specs Object with the box creation specifications
 * @param container Container HTMLElement that holds all the box parts
 * @returns Reference to the Apice Element representing the header
 */
function createHeader(specs, container) {
	const elem = createDiv('apc-header');
	elem.style.display = 'none';
	container.appendChild(elem);
	return element(elem);
}

/**
 * Internal method to create the box body
 * @param container Container HTMLElement that holds all the box parts
 * @returns Reference to the Apice Element representing the body
 */
function createBody(container) {
	const elem = createDiv('apc-body');
	container.appendChild(elem);
	return element(elem);
}

/**
 * Internal method to create the box footer
 * @param specs Object with the box creation specifications
 * @param container Container HTMLElement that holds all the box parts
 * @returns Reference to the Apice Element representing the footer
 */
function createFooter(specs, container) {
	const elem = createDiv('apc-footer');
	elem.style.display = 'none';
	container.appendChild(elem);
	return element(elem);
}

/** Creates the container of an ApiceBox and its internal areas */
function createBoxContainer(specs, box) {
	const parts = {};
	const content = createDiv('apc-box-content');
	parts.header = createHeader(specs, content);
	parts.body = createBody(content);
	parts.footer = createFooter(specs, content);

	parts.box = createDiv('apc-box', specs.id);
	if (specs.fullscreen) {
		parts.box.className += ' apc-full';
	} else if (Array.isArray(specs.size)) {
		parts.box.className += ' apc-non-full';
		parts.box.style.width = specs.size[0];
		parts.box.style.height = specs.size[1];
	}
	parts.box.appendChild(content);
	if (specs.closeable) {
		createClosingButton(parts.box, box);
	}
	return parts;
}

/** Class implementing the box component */
class ApiceBox {
	// identifier of the current box instance
	#id;
	// Object containin the main box parts (area, header, body, footer)
	#elements;
	// numeric indicator to determine the status of the box
	#status; // 1=open 0=closed -1=detached
	// reference to a semaphore that is fulfilled when a delayed content is completed
	// allows to avoid opening the box if there is content being loaded
	#semaphore;

	constructor(specs) {
		if (!specs.id) {
			specs.id = 'box-' + random.tinyId();
		}
		this.#id = specs.id;
		logger.info('Creating box. id={0}', specs.id);
		this.#status = -1;
		this.#elements = createBoxContainer(specs, this);
		this.#semaphore = asynchronous.semaphore();
	}

	/** Allows to obtain the identifier of the current box top container */
	get id() {
		return this.#id;
	}

	/**
	 * Append the current box instance as a child of another element
	 * @param target String with the selector to the element to append the box into it, or reference to its HTMLElement or Apice element
	 */
	appendTo(target) {
		element.append(target, this.#elements.box);
		if (this.#status === -1) {
			this.#status = 0;
		}
		return this;
	}

	/** Closes the current box */
	close() {
		logger.info('Closing box. id={0}', this.#id);
		this.#status = 0;
		this.#elements.box.style.display = 'none';
		return this;
	}

	/**
	 * Opens the current box and returns a promise that is executed after it has been opened
	 * @param content Content to set (or omit this argument to maintain the original content set to the box)
	 * @returns Promise fulfilled when the content is loaded and the box is opened
	 */
	open(content) {
		return new Promise((resolve, reject) => {
			if (content) {
				this.#semaphore.wait(this.content(content));
			}
			// if the box is detached then attach it to the body
			if (!this.#status === -1) {
				this.appendTo(document.body);
			}
			this.#semaphore.then(() => {
				this.#status = 1;
				this.#elements.box.style.display = 'block';
				setTimeout(function () {
					resolve();
				}, 0);
			}).catch(ex => {
				reject(ex);
			});
		});
	}

	/**
	 * Renders a specificic content inside the box
	 * @param content String with thec ontent to add, or reference to an HTMLElement, Apice Element or Promise to be fulfilled with the content
	 * @returns Promise to be fulfilled after the content has been loaded
	 */
	content(content) {
		if (util.isPromise(content)) {
			logger.debug('A promise content has been received for a box. id={0}', this.#id);
			return this.#semaphore.wait(
				content.then(result => {
					logger.debug('Content promise fulfilled for a box. id={0}', this.#id);
					this.#semaphore.wait(this.content(result));
				}).catch(ex => {
					logger.error('An error has occurred fulfilling a box content promise. id={0}', this.#id, ex);
					throw errorHandler.render(ex, this.#elements.body);
				})
			);
		} else if (fragment.isFragment(content)) {
			logger.debug('A fragment content has been received for a box. id={0}', this.#id);
			return this.#semaphore.wait(content.render(this.#elements.body));
		} else {
			logger.debug('A raw content has been received for a box. id={0}', this.#id);
			this.#elements.body.content(content);
			return this.#semaphore.wait(Promise.resolve());
		}
	}
}

$module.create = function (specs) {
	if (!specs) {
		specs = {};
	} else if (typeof (specs) === 'string') {
		specs = { id: specs };
	}
	if (typeof (specs.fullscreen) !== 'boolean') {
		specs.fullscreen = false;
	}
	if (typeof (specs.closeable) !== 'boolean') {
		specs.closeable = false;
	}
	if (!specs.size && !specs.fullscreen) {
		specs.size = ['50%', '50%'];
	}
	return new ApiceBox(specs);
};

export default $module;
