const $module = {};

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
				logger.error('alux.http.xmlhttp_creation_error', ex);
				throw Error('alux.http.xmlhttp_creation_error');
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
				// TODO: creaate a way to identify http errors
				reject({ type: 'http', code: request.status, message: request.status + ' (' + request.statusText + ')' });
			}
		}
	};
	return request;
}

$module.request = function(url, options) {
    if(typeof(url) !== 'string' || !url) {
        throw new Error('alux.http.null_url');
    }
    if(!options) {
        options = {};
    }
    if(!options.method) {
        options.method = 'GET';
    }
    return new Promise(function(resolve, reject) {
        const request = createRequest(resolve, reject);
        request.open(options.method, url, options.async !== false);
        if(options.method === 'GET' || !options.data) {
            request.send();
        } else {
            request.send(options.data);
        }
        
    });
};

export default $module;