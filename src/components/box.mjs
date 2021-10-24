import random from '../random.mjs';
import element from '../element.mjs';
import logging from '../logging.mjs';
import fragment from '../fragment.mjs';
import util from '../util.mjs';
import errorHandler from '../errorHandler.mjs';

const $moduleName = 'apice.ui.box';
const $module = {};
const logger = logging.getLogger($moduleName);

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
	const content = createDiv('apc-box-content');
	const parts = {};
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

	constructor(specs) {
		if (!specs.id) {
			specs.id = 'box-' + random.tinyId();
		}
		this.#id = specs.id;
		logger.info('Creating box. id={0}', specs.id);
		this.#status = -1;
		this.#elements = createBoxContainer(specs, this);
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
		if (this.#status === 1) {
			logger.info('Closing box. id={0}', this.#id);
			this.#status = 0;
			this.#elements.box.style.display = 'none';
		}
		return this;
	}

	/**
	 * Opens the current box and returns a promise that is executed after it has been opened
	 * @param content Content to set (or omit this argument to maintain the original content set to the box)
	 * @returns Promise fulfilled when the content is loaded and the box is opened
	 */
	open(content) {
		return new Promise((resolve, reject) => {
			var contentPromise;
			if (content) {
				contentPromise = this.content(content);
			} else {
				contentPromise = Promise.resolve();
			}
			if (!this.#status === -1) {
				this.appendTo(document.body);
			}
			contentPromise.then(() => {
				if (this.#status === 0) {
					this.#status = 1;
					this.#elements.box.style.display = 'block';
					setTimeout(function () {
						resolve(true);
					}, 0);
				} else {
					resolve(false);
				}
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
		return new Promise((resolve, reject) => {
			if (util.isPromise(content)) {
				content.then(result => {
					this.content(result);
					resolve();
				}).catch(ex => {
					this.close();
					errorHandler.render(ex);
					reject();
				});
			} else if (fragment.isFragment(content)) {
				content.render(this.#elements.body).then(resolve).catch(reject);
			} else {
				this.#elements.body.content(content);
				resolve();
			}
		});
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
