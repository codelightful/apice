import { strict as assert } from 'assert';
import withMockedConsole from './setup/console-mocker.mjs';
await import('./setup/initialize.mjs');
const asynchronous = (await import('../src/asynchronous.mjs')).default;

describe('Asynchronous', function() {
	it('Deferred resolved', function() {
		const deferred = asynchronous.defer();
		assert.ok(deferred);
		deferred.resolve('resolved');
		return deferred.then(function(result) {
			assert.strictEqual(result, 'resolved');
		});
	});

	it('Deferred rejected', function() {
		const deferred = asynchronous.defer();
		assert.ok(deferred);
		deferred.reject('cause');
		return deferred.catch(function(ex) {
			assert.strictEqual(ex, 'cause');
		});
	});

	it('Semaphore without binding a promise', withMockedConsole.done(function(entries, done) {
		// NOTE: this method produces a warning since the wait method is invoked without arguments
		// to avoid test log pollution the mocked console is used
		const semaphore = asynchronous.semaphore();
		semaphore.wait(); // calling the wait without any argument should not execute anything
		assert.ok(semaphore);
		setTimeout(function() {
			assert.equal(semaphore.isBinded(), false, 'The semaphore should NOT be considered binded');
			assert.equal(semaphore.isCompleted(), false, 'The semaphore should NOT be considered completed');
			assert.equal(semaphore.isResolved(), false, 'The semaphore should NOT be considered resolved');
			assert.equal(semaphore.isFailed(), false, 'The semaphore should NOT be considered failed');
			done();
		}, 0);
	}));

	it('Semaphore binding a resolved promise', function() {
		const collector = [];
		const semaphore = asynchronous.semaphore();
		assert.ok(semaphore);
		semaphore.wait(new Promise(function(resolve) {
			collector.push('callback');
			resolve();
		})).then(function() {
			collector.push('wait');
		});
		return semaphore.then(function() {
			collector.push('semaphore');
			assert.equal(semaphore.isBinded(), true, 'The semaphore should be considered binded');
			assert.equal(semaphore.isCompleted(), true, 'The semaphore should be considered completed');
			assert.equal(semaphore.isResolved(), true, 'The semaphore should be considered resolved');
			assert.equal(semaphore.isFailed(), false, 'The semaphore should NOT be considered failed');
			assert.equal(collector[0], 'callback', 'The promise callback should be executed first');
			assert.equal(collector[1], 'wait', 'The wait promise should be executed second');
			assert.equal(collector[2], 'semaphore', 'The semaphore promise should be executed third');
		});
	});

	it('Semaphore binding a failed promise', function() {
		const collector = [];
		const semaphore = asynchronous.semaphore();
		assert.ok(semaphore);
		semaphore.wait(new Promise(function(resolve, reject) {
			collector.push('callback');
			reject('cause');
		})).catch(function(ex) {
			collector.push('wait-catch-' + ex);
		});
		return semaphore.catch(function(ex) {
			collector.push('semaphore-catch-' + ex);
			assert.equal(semaphore.isBinded(), true, 'The semaphore should be considered binded');
			assert.equal(semaphore.isCompleted(), true, 'The semaphore should be considered completed');
			assert.equal(semaphore.isResolved(), false, 'The semaphore should NOT be considered resolved');
			assert.equal(semaphore.isFailed(), true, 'The semaphore should be considered failed');
			assert.equal(collector[0], 'callback', 'The promise callback should be executed first');
			assert.equal(collector[1], 'wait-catch-cause', 'The wait catch should be executed second');
			assert.equal(collector[2], 'semaphore-catch-cause', 'The semaphore catch should be executed third');
		});
	});

	it('Semaphore binding a resolved and a failed promise', function() {
		const collector = [];
		const semaphore = asynchronous.semaphore();
		assert.ok(semaphore);
		semaphore.wait(new Promise(function(resolve) {
			collector.push('callback-1');
			resolve();
		})).then(function() {
			collector.push('wait-1');
		}).catch(function(ex) {
			collector.push('wait-1-catch-' + ex);
		});
		semaphore.wait(new Promise(function(resolve, reject) {
			collector.push('callback-2');
			reject('cause');
		})).then(function() {
			collector.push('wait-2');
		}).catch(function(ex) {
			collector.push('wait-2-catch-' + ex);
		});
		return semaphore.then(function() {
			collector.push('semaphore');
		}).catch(function(ex) {
			collector.push('semaphore-catch-' + ex);
			assert.equal(semaphore.isBinded(), true, 'The semaphore should be considered binded');
			assert.equal(semaphore.isCompleted(), true, 'The semaphore should be considered completed');
			assert.equal(semaphore.isResolved(), false, 'The semaphore should NOT be considered resolved');
			assert.equal(semaphore.isFailed(), true, 'The semaphore should be considered failed');
			assert.equal(collector[0], 'callback-1', 'The promise 1 callback should be executed first');
			assert.equal(collector[1], 'callback-2', 'The promise 2 callback should be executed second');
			assert.equal(collector[2], 'wait-1', 'The wait callback for promise 1 should be executed third');
			assert.equal(collector[3], 'wait-2-catch-cause', 'The wait catch for promise 2 should be executed fourth');
			assert.equal(collector[4], 'semaphore-catch-cause', 'The semaphore catch should be executed fifth');
			assert.equal(collector.length, 5, 'The number of captured event is wrong: ' + JSON.stringify(collector));
		});
	});
});
