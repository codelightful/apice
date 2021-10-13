import logging from '../logging.mjs';
import events from '../events.mjs';

const $module = {};
const $moduleName = 'apice.ui.mask';
const logger = logging.getLogger($moduleName);

/** Shows the protective mask */
$module.show = function () {
	logger.trace('Showing protective mask');
	return new Promise(resolve => {
		var mask = document.getElementById('apice-mask');
		if (!mask) {
			mask = document.createElement('div');
			mask.id = 'apice-mask';
			mask.className = 'apc-mask';
			document.body.appendChild(mask);
		}
		mask.style.display = 'block';
		events.waitAnimation(mask, 'apc-mask apc-open', resolve);
	});
};

/** Hides the protective mask */
$module.hide = function () {
	logger.trace('Hidding protective mask');
	return new Promise(resolve => {
		const mask = document.getElementById('apice-mask');
		if (mask) {
			events.waitAnimation(mask, 'apc-mask apc-closed', () => {
				mask.style.display = 'none';
				resolve();
			});
		}
	});
};

export default $module;
