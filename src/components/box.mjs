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

function createHeader(specs, container) {
	const elem = createDiv('apc-header');
	elem.style.display = 'none';
	container.appendChild(elem);
	return element(elem);
}

function createBody(container) {
	const elem = createDiv('apc-body');
	elem.innerHTML = 'BOX-CONTENT'; // FIXME: remove
	container.appendChild(elem);
	return element(elem);
}

function createFooter(specs, container) {
	const elem = createDiv('apc-footer');
	elem.innerHTML = 'BOX-FOOTER'; // FIXME: remove
	elem.style.display = 'none';
	container.appendChild(elem);
	return element(elem);
}

/** Creates the container of an ApiceBox and its internal areas */
function createBoxContainer(specs, box) {
	const container = createDiv('apc-box', specs.id);
	if (specs.fullscreen) {
		container.className += ' apc-full';
	} else if (Array.isArray(specs.size)) {
		container.className += ' apc-non-full';
		container.style.width = specs.size[0];
		container.style.height = specs.size[1];
	}
	const content = createDiv('apc-box-content');
	const parts = {};
	parts.header = createHeader(specs, content);
	parts.body = createBody(content);
	parts.footer = createFooter(specs, content);
	parts.area = container;
	container.appendChild(content);
	if (specs.closeable) {
		createClosingButton(container, box);
	}
	return parts;
}

/** Class implementing the box component */
class ApiceBox {
	// Object containin the main box parts (area, header, body, footer)
	#elements;
	// element where the top element is attached 
	#container;
	// numeric indicator to determine the status of the box
	#status; // 1=open 0=closed -1=detached

	constructor(specs) {
		if (!specs.id) {
			specs.id = 'box-' + random.tinyId();
		}
		this.#status = -1;
		this.#elements = createBoxContainer(specs, this);
	}

	/**
	 * Append the current box instance as a child of another element
	 * @param target String with the selector to the element to append the box into it, or reference to its HTMLElement or Apice element
	 */
	appendTo(target) {
		element.append(target, this.#elements.area);
		this.#container = this.#elements.area.parentElement;
		this.#status = (this.#container) ? 0 : -1;
		return this;
	}

	/** Closes the current box */
	close() {
		if (this.#status === 1) {
			this.#container.removeChild(this.#elements.area);
			this.#status = 0;
		}
		return this;
	}

	/** Opens the current box */
	open() {
		if (this.#status === 0) {
			this.#container.appendChild(this.#elements.area);
			this.#status = 1;
		}
		return this;
	}

	/**
	 * Renders a specificic content inside the box
	 * @param content String with thec ontent to add, or reference to an HTMLElement, Apice Element or Promise to be fulfilled with the content
	 * @returns 
	 */
	content(content) {
		if (util.isPromise(content)) {
			content.then(result => {
				this.content(result);
			}).catch(ex => {
				this.close();
				errorHandler.render(ex);
			});
		} else if (fragment.isFragment(content)) {
			content.render(this.#elements.body);
		} else {
			this.#elements.body.content(content);
		}
		return this;
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
