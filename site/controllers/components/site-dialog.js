'use strict';

function createDialog(style, id, body) {
	const method = Apice.ui.dialog[style];
	const dialog = method({ id: id, body: body });
	dialog.addButton('close');
	dialog.addButton({ label: 'Ok', close: true, action: function() {
		console.log('The Ok button has been presed on ' + id);
		return true;
	}});
	dialog.onClose(() => {
		console.log('Close event: ' + id);
	});
	dialog.open().then(() => {
		console.log('Open promise: ' + id);
	});
	return dialog;
}

Apice.controller.declare('dialog', () => {
	createDialog('error', 'dialog1', 'This is the dialog 1');
	createDialog('warn', 'dialog2', 'This is the dialog 2');
	createDialog('info', 'dialog3', 'This is the dialog 3');
	createDialog('success', 'dialog4', 'This is the dialog 4');
});