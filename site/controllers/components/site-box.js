'use strict';

Apice.controller.declare('box', () => {
	const box = Apice.ui.box.create({ 
		size: ['60%', '60%'], 
		closeable: true,
		header: false,
		footer: false
	}).appendTo('#contentArea');
	box.open('<div class="apc-badge apc-info">Loading please wait</div>').then(function() {
		console.log('This is executed after the content is loaded and the box is opened');
	});
	setTimeout(function() {
		box.content(Apice.fragment('long')).then(function() {
			console.log('This is executed after the content has been loaded');
		});
	}, 2000);
});