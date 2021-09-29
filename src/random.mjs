/** Creates a random tiny identified composed by 4 alphanumeric characters */
function tinyId() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

/** Creates a random short identified composed by 8 alphanumeric characters */
function shortId() {
	return tinyId() + tinyId();
};

/** Creates a random values simulating a global global unique identifier */
function guid() {
	return shortId()
		+ '-' + shortId()
		+ '-' + shortId()
		+ '-' + shortId()
		+ shortId();
};

export default { tinyId, shortId, guid };