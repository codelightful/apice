const $module = {};

$module.random = {};

/** Creates a random tiny identified composed by 4 alphanumeric characters */
$module.random.tinyId = function() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

/** Creates a random short identified composed by 8 alphanumeric characters */
$module.random.shortId = function() {
	return $module.random.tinyId() + $module.random.tinyId();
};

/** Creates a random values simulating a global global unique identifier */
$module.random.guid = function () {
	return $module.random.shortId()
		+ '-' + $module.random.shortId()
		+ '-' + $module.random.shortId()
		+ '-' + $module.random.shortId()
		+ $module.random.shortId();
};

export default $module;