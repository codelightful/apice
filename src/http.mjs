import errorHandler from './errorHandler.mjs';

const $module = {};
const $moduleName = 'apice.http';

/** Creates the underlying XMLHTTP object used to execute ajax calls */
function createXmlHttp() {
	if (window.XMLHttpRequest) {
		return new XMLHttpRequest();
	} else {
		try {
			return new ActiveXObject('Msxml2.XMLHTTP');
		} catch (e) {
			try {
				return new ActiveXObject('Microsoft.XMLHTTP');
			} catch (ex) {
				throw Error('apice.http.xmlhttp_creation_error');
			}
		}
	}
}

/** Create a request object to execute ajax calls in a crossbrowser approach */
function createRequest(resolve, reject) {
	const request = createXmlHttp();
	request.onreadystatechange = function () {
		if (request.readyState == 4 || request.readyState === 'complete') {
			if (request.status == 200) {
				resolve(request.responseText);
			} else {
				reject(errorHandler.createHttpError(request.status));
			}
		}
	};
	return request;
}

/**
 * 
 * @param url String with the resource URL to be requested
 * @param options Object with the options to execute the request. The values are:
 * 					- method: String with the HTTP method to execute: GET, POST, PUT, DELETE. If this is not provided, GET will be used by default.
 * 					- async: Boolean value to determine if the request should be asynchronous (true) or not. By default it is true.
 *                  - data: Data to be included in a POST, PUT or DELETE request
 * @returns Promise to be fulfilled according to the HTTP request result
 */
$module.request = function (url, options) {
	if (typeof (url) !== 'string' || !url) {
		return Promise.reject('apice.http.null_url');
	}
	if (!options) {
		options = {};
	}
	if (!options.method) {
		options.method = 'GET';
	}
	// TODO: add headers
	return new Promise((resolve, reject) => {
		const request = createRequest(resolve, reject);
		request.open(options.method, url, options.async !== false);
		if (options.method === 'GET' || !options.data) {
			request.send();
		} else {
			request.send(options.data);
		}
	});
};

/**
 * Loads a JavaScript resource dynamically
 * @param url URL to load the script from it
 * @returns Promise that allows to handle the script loading actions
 */
$module.loadScript = function (url) {
	return new Promise((resolve, reject) => {
		var element = document.createElement('script');
		element.src = url;
		element.type = 'text/javascript';
		element.async = false;
		element.onerror = () => {
			reject(errorHandler.create({
				module: $moduleName,
				code: `apice.http.load_script_error[${url}]`
			})); // TODO: collect error info
		};
		element.onload = () => {
			resolve();
		};
		document.head.appendChild(element);
	});
};

/** Class representing a URL assembled with different parts */
class ApiceUrl {
	// string with the HTTP protocol (http, https)
	#protocol
	// String wit the host name
	#host
	// String with the port
	#port
	// String with the resource path
	#path

	/**
	 * Creates a new instance representing a url by providing its parts
	 * @param protocol String with the HTTP protocol to use (http, https) or null to use https as default
	 * @param host String with the host name. This parameter is mandatory, when is not ptovided an error will be throw
	 * @param port String with the port number or null to use port 80 as the default one
	 * @param path String with the base path or null to use the root
	 */
	constructor(protocol, host, port, path) {
		if (!this.#host) {
			throw new Error('apice.http.url.no_host');
		}
		this.#protocol = protocol ?? 'https';
		this.#host = host;
		this.#port = port ?? '80';
		this.#path = path ?? '';
	}

	/** Obtains the HTTP protocol used by the url */
	get protocol() {
		return this.#protocol;
	}

	/** Obtains the host used by the url */
	get host() {
		return this.#host;
	}

	/** Obtains the port used by the url */
	get port() {
		return this.#port;
	}

	/** Obtains the base path used by the url */
	get path() {
		return this.#path;
	}

	/** Creates a string representation of this url */
	toString() {
		return this.#protocol + '://' + this.#host + ':' + this.#port + '/' + this.#path;
	}

	/**
	 * Creates a url string using the base url represented by this instance and concatenating additional elements
	 * @param path String with the path of an additional resource to be added to the base url represented by this instance or null to ignore it.
	 * @param query Query string to add to the base URL represented by this instance or null to ignore it.
	 * @param hash Hash to add to the base URL represented by this instance or null to ignore it.
	 * @returns String with a full url
	 */
	resourceUrl(path, query, hash) {
		var url = this.toString();
		if (path && typeof (path) === 'string') {
			if (!url.endsWith('/') && !path.startsWith('/')) {
				url += '/';
			}
			url += path;
		}
		if (query && typeof (query) === 'string') {
			if (!query.startsWith('?')) {
				url += '?';
			}
			url += query;
		}
		if (hash && typeof (hash) === 'string') {
			if (!hash.startsWith('#')) {
				url += '#';
			}
			url += hash;
		}
		return url;
	}

	/**
	 * Executes an HTTP GET operation using the URL represented by this instance and adding additional elements
	 * @param path Resource path to add to the base url represented by this instance or null to maintain the original 
	 * @param query Query string to add to the base URL represented by this instance
	 * @param hash Hash to add to the base url represented by this instance
	 * @returns A promise to capture the execution of the HTTP request
	 */
	get(path, query, hash) {
		var url = this.resourceUrl(path, query, hash);
		return $module.request(url, { method: 'GET' });
	}

	/**
	 * Executes an HTTP POST operation using the URL represented by this instance and adding a resource path and data
	 * @param path Resource path to add to the base url represented by this instance or null to maintain the original 
	 * @param data Object to post as data in the HTTP request
	 * @returns A promise to capture the execution of the HTTP request
	 */
	post(path, data) {
		var url = this.resourceUrl(path);
		return $module.request(url, { method: 'POST', data: data });
	}

	/**
	 * Executes an HTTP PUT operation using the URL represented by this instance and adding a resource path and data
	 * @param path Resource path to add to the base url represented by this instance or null to maintain the original 
	 * @param data Object to post as data in the HTTP request
	 * @returns A promise to capture the execution of the HTTP request
	 */
	put(path, data) {
		var url = this.resourceUrl(path);
		return $module.request(url, { method: 'PUT', data: data });
	}

	/**
	 * Executes an HTTP DELETE operation using the URL represented by this instance and adding a resource path and data
	 * @param path Resource path to add to the base url represented by this instance or null to maintain the original 
	 * @param data Object to post as data in the HTTP request
	 * @returns A promise to capture the execution of the HTTP request
	 */
	delete(path, data) {
		var url = this.resourceUrl(path);
		return $module.request(url, { method: 'DELETE', data: data });
	}
}

/** Class to manipulate and create an URL */
class UrlBuilder {
	// string with the HTTP protocol (http, https)
	#protocol
	// String wit the host name
	#host
	// String with the port
	#port
	// String with the resource path
	#path

	/**
	 * Defines the HTTP protocol to be used by the url
	 * @param protocol String with the protocol. Example: https
	 * @returns Fluent instance to continue the build
	 */
	protocol(protocol) {
		this.#protocol = protocol;
		return this;
	}

	/**
	 * Defines the name of the host to be used in the url to be build
	 * @param host String with the hostname
	 * @returns Fluent instance to continue the build
	 */
	host(host) {
		this.#host = host;
		return this;
	}

	/**
	 * Defines the port to use in the url to be build
	 * @param port String or number with the port
	 * @returns Fluent instance to continue the build
	 */
	port(port) {
		var portType = typeof (port);
		if (portType === 'string') {
			this.#port = port;
		} else if (portType === 'number') {
			this.#port = String(port);
		} else {
			throw new Error('apice.http.url_builder.invalid_port');
		}
		return this;
	}

	/**
	 * Defines the base path to set in the url to be build
	 * @param path String with the base path to use
	 * @returns Fluent instance to continue the build
	 */
	path(path) {
		this.#path = path;
		return this;
	}

	/**
	 * Creates a new url instance based on the arguments collected by this builder instance
	 * @returns Instance representing the Url
	 */
	build() {
		return new ApiceUrl(this.#protocol, this.#host, this.#port, this.#path);
	}
}

/**
 * Allows to obtain a builder to create an url
 * @returns Instance of the url builder
 */
$module.url = function () {
	return new UrlBuilder();
};

export default $module;