'use strict';

Apice.controller.declare('toast', () => {
	const fieldTypes = [
		{ label: 'Error', code: 'error' },
		{ label: 'Warning', code: 'warn' },
		{ label: 'Information', code: 'info' },
		{ label: 'Success', code: 'success' }
	];

	Apice.element('#btnToastCreate').click(function () {
		const data = Apice.form.collect('#divToastForm');
		const toastMethod = Apice.ui.toast[data.level];
		if (typeof (toastMethod) !== 'function') {
			Apice.ui.toast.error('Unknown level type: ', data.level);
		} else {
			const specs = {};
			specs.message = data.message;
			if (!data.title.flag) {
				specs.title = false;
			} else if (data.title.text) {
				specs.title = data.title.text;
			}
			if (!data.dismiss.enable) {
				specs.dismiss = false;
			} else {
				if (data.dismiss.manual) {
					specs.dismiss = true;
				} else {
					specs.dismiss = parseInt(data.dismiss.seconds);
				}
			}
			toastMethod(specs);
		}
	});

	//Apice.ui.toast.warn(false, 'This is a toast message with no title');

	//Apice.ui.toast.info('Default title and a text message no icon');
	//Apice.ui.toast.info(false, 'This is a toast message with no title');

	//Apice.ui.toast.success('Default title and a text message no icon');
	//

	//Apice.ui.toast.info('Custom title', 'This is a toast message with a custom title');
	//Apice.ui.toast.info('This is a toast message with a long message containing text to validate what is the default overflow behavior when this happens and review it to determine if it does allow the expansion of text and vertical growth of the content');
});