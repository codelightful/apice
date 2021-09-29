import random from '../random.mjs';
import element from '../element.mjs';
import logging from '../logging.mjs';

const $moduleName = 'apice.ui.form';
const $module = {};
const logger = logging.getLogger($moduleName);

function getSizeClass(specs) {
    if (specs.size === 'xs') {
        return ' apc-xs';
    } else if (specs.size === 'sm') {
        return ' apc-sm';
    } else if (!specs.size || specs.size === 'md') {
        return ' apc-md';
    } else if (!specs.size || specs.size === 'lg') {
        return ' apc-lg';
    } else {
        return ' apc-xl';
    }
    return '';
}

function getFieldClass(specs) {
    let fieldClass = 'apc-field';
    // type modifier
    if (specs.type === 'input') {
        fieldClass += ' apc-text';
    } else if (specs.type === 'check') {
        fieldClass += ' apc-check';
    } else if (specs.type === 'select') {
        fieldClass += ' apc-select';
    }
    // sizing  modifier
    fieldClass += getSizeClass(specs);
    return fieldClass;
}

/**
 * Internal method to create an option DOM elements and add it to a field
 * @param field Reference to the field to add the option on it
 * @param label String with the option label
 * @param value String with the value
 */
function createOption(field, label, value) {
    const option = document.createElement('option');
    option.innerHTML = label;
    option.value = value;
    field.appendChild(option);
}

/**
 * Fills the options in a select field based on specific data
 * @param field Reference to the field to add the options on it
 * @param data Array with the data in the form {label: 'string', value: 'string'}, or reference to a function that produces such array, or promise that produces the array when is fullfilled
 */
function fillSelect(field, data) {
    if(!data) {
        return;
    } else if(typeof(data) === 'function') {
        const result = data(); // FIXME: add error handling
        fillSelect(field, result);
        return;
    } else if(data instanceof Promise) {
        data.then(result => {
            fillSelect(field, result);
        }).catch(err => {
            // FIXME: implement
        });
        return;
    } else if (!Array.isArray(data) || data.length === 0) {
        data = ['No data'];
    }
    createOption(field, 'Please select...', '');
    data.map(item => {
        createOption(field, item.label, item.value);
    });
}

class BlockElement {
    #element;
    #rendered;

    constructor(className, size) {
        this.#element = document.createElement('div');
        this.#element.className = className + getSizeClass({ size: size });
        this.#element.innerHTML = '&nbsp;';
    }

    render(container) {
        if(this.#rendered) {
            return;
        }
        this.#rendered = true;
        container.appendChild(this.#element);
    }
}

class ApiceButton {
    #id;
    #element;
    #rendered;

    constructor(specs) {
        if(!specs) {
            throw Error('apice.ui.form.button.null_specs');
        }
        if(!specs.id) {
            specs.id = 'btn_' + random.tinyId();
        }
        this.#id = specs.id;
        this.#element = document.createElement('button');
        this.#element.id = specs.id;
        this.#element.className = 'apc-button';
        this.#element.innerHTML = specs.label;
        this.#rendered = false;
    }

    click(fnc) {
        if(arguments.length === 0) {
            if(this.#element.onclick) {
                this.#element.onclick();
                // FIXME: change by trigger event
            }
            return;
        }
        if(typeof(fnc) !== 'function') {
            this.#element.onclick = null;
            return;
        }
        this.#element.onclick = fnc;
    }

    render(container) {
        if(this.#rendered) {
            return;
        }
        this.#rendered = true;
        container.appendChild(this.#element);
    }
}

class ApiceButtonBar {
    #buttons;
    #rendered;
    #element;

    constructor() {
        this.#buttons = [];
        this.#rendered = false;
        this.#element = document.createElement('div');
        this.#element.className = 'apc-button-bar';
    }

    addButton(specs) {
        if(!specs) {
            return;
        }
        const button = new ApiceButton(specs);
        this.#buttons.push(button);
        if(this.#rendered) {
            button.render();
        }
        return button;
    }

    render(container) {
        if(this.#rendered) {
            return;
        }
        this.#rendered = true;
        this.#buttons.map(button => button.render(this.#element));
        container.appendChild(this.#element);
    }
}

/** Represents a field inside a dynamic Apice form */
class ApiceField {
    #id;
    #type;
    #label;
    #group;
    #field;
    #source;

    constructor(specs) {
        if (!specs.id) {
            specs.id = 'field_' + random.tinyId();
        }
        if (!specs.type) {
            specs.type = 'input'
        }
        this.#id = specs.id;
        this.#type = specs.type;
        this.#label = specs.label;
        this.#group = document.createElement('div');
        this.#group.className = getFieldClass(specs);
        this.#createField(specs);
    }

    /** Internal method to create the label for the form field represented by the instance */
    #renderLabel() {
        if (this.#label) {
            const labelBox = document.createElement('label');
            labelBox.setAttribute('for', this.#id);
            labelBox.className = 'apc-label'
            labelBox.innerHTML = this.#label;
            this.#group.appendChild(labelBox);
        }
    }

    /** Internal method to create the area of the field represented by the instance */
    #createField(specs) {
        if (this.#type === 'input') {
            this.#field = document.createElement('input');
            this.#field.type = 'text';
        } else if (this.#type === 'check') {
            this.#field = document.createElement('input');
            this.#field.type = 'checkbox';
        } else if (this.#type === 'select') {
            this.#field = document.createElement('select');
            fillSelect(this.#field, specs.source);
        }
    }

    render(container) {
        if (this.#field) {
            this.#group.appendChild(this.#field);
        }
        this.#renderLabel();
        container.appendChild(this.#group);
    }
}

/** Represents a dynamic form */
class ApiceForm {
    /** Holds the form ID */
    #id
    /** Allows to determine if the form has been rendered already or not */
    #rendered;
    /** Array containing the form content objects */
    #content;
    /** Reference to the top DOM element containing the visual representation of the form */
    #element;

    constructor(selector) {
        this.#id = 'form_' + random.tinyId();
        this.#content = [];
        this.#rendered = false;

        const formElement = document.createElement('div');
        formElement.id = this.#id;
        formElement.className = 'apc-form';
        this.#element = formElement;

        const container = element(selector);
        container.append(formElement);
    }

    #addComponent(component) {
        if(!component) {
            return;
        }
        this.#content.push(component);
        if (this.#rendered) {
            component.render(this.#element);
        }
    }

    addField(specs) {
        if (!specs) {
            return;
        }
        const component = new ApiceField(specs);
        this.#addComponent(component);
        return component;
    }

    addSpacer(size) {
        var component = new BlockElement('apc-spacer', size);
        this.#addComponent(component);
    }

    addBreak() {
        var component = new BlockElement('apc-break')
        this.#addComponent(component);
    }

    addButtonBar() {
        var component = new ApiceButtonBar();
        this.#addComponent(component);
        return component;
    }

    addButton(specs) {
        if(!specs) {
            return;
        }
        var component = new ApiceButton(specs);
        this.#addComponent(component);
        return component;
    }

    render() {
        if (this.#rendered) {
            return;
        }
        this.#rendered = true;
        this.#content.map(child => child.render(this.#element));
        return this;
    }
}

$module.create = function (selector) {
    return new ApiceForm(selector);
};

export default $module;
