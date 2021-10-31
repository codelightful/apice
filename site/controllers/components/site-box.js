'use strict';

Apice.controller.declare('box', () => {
	const box = Apice.ui.box.create({ 
		size: ['60%', '60%'], 
		closeable: true,
		header: false,
		footer: false
	}).appendTo('#contentArea');
	// open the box with a static content on it, then triggers a callback once it has been opened
	box.open('<div class="apc-badge apc-info">Loading please wait</div>').then(function() {
		console.log('The box static content is loaded and opened');
		// loads a dynamic content that rely on a promise for its execution
		box.content(new Promise(function(resolve, reject) {
			setTimeout(function() {
				console.log('First promised is reolved');
				resolve(new Promise(function(innerResolve, innerReject) { 
					setTimeout(function() { 
						console.log('Second promise is resolved');
						// finally returns a fragment as part of the internal promise
						innerResolve(Apice.fragment('long')); 
					}, 2000); 
				}));
			}, 2000);
		})).then(function() {
			console.log('Box content completed');
		});
	});
});