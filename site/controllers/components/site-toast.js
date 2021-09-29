'use strict';

Apice.controller.declare('toast', () => {
	const fieldTypes = [
		{ label: 'Error', code: 'error' },
		{ label: 'Warning', code: 'warn' },
		{ label: 'Information', code: 'info' },
		{ label: 'Success', code: 'success' }
	];

	/*
	.addButton({ label: 'Create Toast' }).click(() => {
		Apice.ui.toast.error('Default title and a text message no icon');
	});
	*/

	//Apice.ui.toast.warn('Default title and a text message no icon');
	//Apice.ui.toast.warn(false, 'This is a toast message with no title');

	//Apice.ui.toast.info('Default title and a text message no icon');
	//Apice.ui.toast.info(false, 'This is a toast message with no title');

	//Apice.ui.toast.success('Default title and a text message no icon');
	//Apice.ui.toast.success(false, 'This is a toast message with no title');

	//Apice.ui.toast.info('Custom title', 'This is a toast message with a custom title');
	//Apice.ui.toast.info('This is a toast message with a long message containing text to validate what is the default overflow behavior when this happens and review it to determine if it does allow the expansion of text and vertical growth of the content');
});