'use strict';

Apice.controller.declare('semaphore', () => {
    const semaphore = Apice.asynchronous.semaphore().then(function() {
		console.log('The semaphore has been fulfilled');
	}).catch(ex => {
		console.log('A promise in the semaphore has failed');
	});

	semaphore.wait(new Promise(function(resolve, reject) { 
		setTimeout(function() {
			console.log('Promise 1 resolved');
			resolve();
		}, 1000);
	})).then(function() {
		console.log('Wait 1 resolved');
	});

	semaphore.wait(new Promise(function(resolve, reject) { 
		setTimeout(function() {
			console.log('Promise 2 resolved');
			reject('xxx');
		}, 2000);
	})).then(function() {
		console.log('Wait 2 resolved');
	}).catch(ex => {
		console.log('Wait 2 failed');
	});

	semaphore.wait(new Promise(function(resolve, reject) { 
		setTimeout(function() {
			console.log('Promise 3 resolved');
			resolve();
		}, 3000);
	})).then(function() {
		console.log('Wait 3 resolved');
	});

	semaphore.wait().then(function() {
		console.log('Wait 4 resolved');
	});
});
