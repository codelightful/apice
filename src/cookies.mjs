const $module = {};

function trim(text) {
    return text.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}

/**
 * Sets a specific cookie
 * @param name Name of the cookie to set
 * @param value Value to set
 * @param timespan Timspan to maintain the cookie in seconds
 */
$module.set = function(name, value, timespan) {
    if(typeof(name) !== 'string') {
        throw new Error('alux.cookies.set.invalid_name');
    } else if (typeof (timespan) !== 'number') {
        throw new Error('alux.cookies.set.invalid_timespan');
    }
    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + (timespan * 1000));
    var cookie = trim(name) + '=' + value + '; expires=' + expireDate.toGMTString() + '; path=/';
    document.cookie = cookie;
};

/**
 * Obtains the value from a cookie
 * @param name Name of the cookie to obtain
 * @returns Cookie value or null if it is not defined
 */
$module.get = function(name) {
    if(typeof(name) !== 'string') {
        throw new Error('alux.cookies.get.invalid_name');
    }
    const cookieArray = document.cookie.split(';');
    var cookieValue = null;
    for(var idx=0; idx < cookieArray.length; idx++) {
        const rawCookie = trim(cookieArray[idx]);
        if(!rawCookie) {
            continue;
        }
        const cookieParts = rawCookie.split('=');
        if(trim(cookieParts[0]) !== name) {
            continue;
        }
        return cookieParts[1];
    }
    return null;
};

export default $module;