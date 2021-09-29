import logging from '../logging.mjs';

const $moduleName = 'apice.ui.toast';
const $module = {};

const $scope = {};
$scope.styles = {};
$scope.styles['info'] = { title: 'Information', icon: '', color: {} }

const logger = logging.getLogger($moduleName);

function createToastContainer() {
    var container = document.getElementById('apc-toast-container');
    if(!container) {
        container = document.createElement('div');
        container.id = 'apc-toast-container';
        document.body.appendChild(container);
    }
    return container;
}

class ApiceToast {
    #style;
    #title;
    #body;
    #icon;
    #box;
    #dismiss;

    constructor(specs) {
        this.#style = specs.style;
        this.#title = { text: specs.title };
        this.#body = { text: specs.message };
        this.#icon = { resource: specs.icon };
        this.#dismiss = specs.dismiss;
        this.#render();
    }

    get title() {
        if(!this.#title.text && this.#title.text !== false) {
            if(this.#style === 'error') {
                return 'Error!';
            } else if(this.#style === 'warn') {
                return 'Warning!';
            } else if(this.#style === 'info') {
                return 'Info';
            } else if(this.#style === 'success') {
                return 'Success!';
            } 
        }
        return this.#title.text;
    }

    set title(text) {
        this.#title.text = text;
        this.#renderTitle();
    }

    get message() {
        return this.#body.text;
    }

    #renderTitle() {
        var text = this.title;
        if(!text) {
            if(this.#title.box) {
                this.#title.box.style.display = 'none';
            }
            return;
        }
        if(!this.#title.box) {
            this.#title.box = document.createElement('div');
            this.#title.box.className = 'apc-header';
            this.#box.appendChild(this.#title.box);
        }
        this.#title.box.style.display = 'block';
        this.#title.box.innerHTML = text;
    }

    #renderBody() {
        if(!this.#body.box) {
            this.#body.box = document.createElement('div');
            this.#body.box.className = 'apc-body';
            this.#box.appendChild(this.#body.box);
        }
        this.#body.box.innerHTML = this.message;
    }

    #renderIcon() {
        if(!this.#icon.resource) {
            if(this.#icon.box) {
                this.#icon.box.style.display = 'none';
            }
            return;
        }
        if(!this.#icon.box) {
            this.#icon.box = document.createElement('div');
            this.#icon.box.className = 'apc-icon';
            this.#box.appendChild(this.#icon.box);
        }
        if(this.#icon.resource === true) {
            this.#icon.box.className = 'apc-icon icon-' + this.#style;
            this.#icon.box.innerHTML = '&nbsp;';
        } else {
            // TODO: implement
        }
    }

    #render() {
        if(!this.#box) {
            this.#box = document.createElement('div');
        }
        this.#box.className = 'apc-toast toast-' + this.#style;
        this.#renderIcon();
        this.#renderTitle();
        this.#renderBody();
    }

    appendTo(container) {
        container.appendChild(this.#box);
    }
}

function renderToast() {
    const specs =  { title: null, message: null, icon: true };
    specs.style = arguments[0];
    if(arguments.length === 2) {
        specs.message = arguments[1];
    } else if(arguments.length === 3) {
        specs.title = arguments[1];
        specs.message = arguments[2];
    }
    if(!specs.message) {
        logger.warn('A toast has been requested without message. The toast has been ignored');
        return;
    }
    const toast = new ApiceToast(specs);
    const container = createToastContainer();
    toast.appendTo(container);
}

$module.error = function() {
    renderToast('error', ...arguments);
};

$module.warn = function() {
    renderToast('warn', ...arguments);
};

$module.info = function() {
    renderToast('info', ...arguments);
};

$module.success = function() {
    renderToast('success', ...arguments);
};

$module.setMax = function() {
    
};

export default $module;
