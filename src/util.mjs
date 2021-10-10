// NOTE: this module is a low level module and should not import any other module
const $module = {};

//-----------------------------------------------------------------------------
// OBJECT EVALUATION
//-----------------------------------------------------------------------------
/**
 * Allows to determine if a specific object instance is a promise or not
 * @param target Object instance to evaluate
 * @returns Boolean value to determine if the object instance is a promise or not
 */
$module.isPromise = function (target) {
	return (target instanceof Promise);
};

//-----------------------------------------------------------------------------
// STRING MANIPULATION
//-----------------------------------------------------------------------------
/** Trims a string by removing leading and trailing white spaces  */
$module.trim = function (text) {
	if(!text) {
		return '';
	}
	return text.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

// regular expression to extract the message placeholders
const holderRegex = /\{(\d+)\}/g;

/**
 * Replaces all the placeholders in a string
 * @param input String containing the placeholders to replace. Each placeholder will be identified
 * 			with a numeric index (starting at zero) between curly brackets.
 * @param values Array with the values to replace the placeholders.
 * @returns Object containing the output text and the unbinded values. It has the shape: { output: 'string', unbind: array };
 */
$module.placeholders = function (input, ...values) {
	const result = { output: input, unbind: values };
	if (typeof (input) !== 'string' || !values || values.length === 0) {
		return result;
	}
	const indexControl = {};
	const holders = input.matchAll(holderRegex);
	for (let holder of holders) {
		const source = holder[1];
		if (!source || indexControl[source]) {
			continue;
		}
		indexControl[source] = true;
		const regex = new RegExp('\\{' + source + '\\}', 'g');
		const value = values[source];
		if(typeof(value) === 'undefined') {
			continue;
		}
		result.unbind[source] = null;
		result.output = result.output.replace(regex, value);
	}
	// removes the elements that have been used
	result.unbind = result.unbind.filter((element) => {
		return element !== undefined && element !== null;
	});
	return result;
};

export default $module;