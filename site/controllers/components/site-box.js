'use strict';

Apice.controller.declare('box', () => {
	const box = Apice.ui.box.create({ 
		size: ['60%', '60%'], 
		closeable: true,
		header: false,
		footer: false
	}).content(Apice.fragment('long'))
		.appendTo('#contentArea')
		.open();
});