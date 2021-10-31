import random from './random.mjs';
import logging from './logging.mjs';

const $module = {};
const logger = logging.getLogger('apice.async');

/** Creates a promise that uses the deferred pattern */
$module.defer = function() {
	const bindings = {};
	const deferred = new Promise((resolve, reject) => {
		bindings.resolve = resolve;
		bindings.reject = reject;
	});
	deferred.resolve = bindings.resolve;
	deferred.reject = bindings.reject;
	return deferred;
};

/** 
 * Internal class to control the execution of more than one promise. The main difference with Promise.all
 * is that Promise.all binded promises cannot be changed after the declaration, while this allows to add
 * more promises dynamically
 */
class Semaphore {
	/** Srring with the identifier of the current instance */
	#id;
	/** Internal object with the counters for the binded, resolved and failed promises */
	#counter;
	/** Hold the reference to the deferred promise returned as part of this semaphore */
	#deferred;
	/** Hold the reference to the resolve promise */
	#resolve;
	/** Hold the reference to the rejection promise */
	#reject;

	constructor() {
		this.#id = 'semaphore_' + random.shortId();
		logger.debug('Semaphore created. semaphore={0}', this.#id);
		this.#counter = { binded: 0, resolved: 0, failed: 0 };
		this.#deferred = new Promise((resolve, reject) => {
			this.#resolve = resolve;
			this.#reject = reject;
		});
	}

	/** Adds a promise to the current instance to be monitored for its resolution or failure */
	wait(promise) {
		if(!promise) {
			logger.warn('Semaphore wait has been invoked without providing a promise. semaphore={0}', this.#id);
			return;
		}
		this.#counter.binded ++;
		promise.semaphore = random.shortId();
		logger.debug('Adding new promise. semaphore={0} promise={1}', this.#id, promise.semaphore);
		return promise.then(() => {
			logger.debug('Semaphore promise resolved. semaphore={0} promise={1}', this.#id, promise.semaphore);
			this.#counter.resolved ++;
			if(this.#counter.binded === this.#counter.resolved) {
				// NOTE: since the returned promise may have its own then-callback we need to add this execution 
				// to the eventloop in order to have the semaphore resolved after it
				setTimeout(() => {
					this.#resolve();
				}, 0);
			}
		}).catch(ex => {
			logger.debug('Semaphore promise rejected. semaphore={0} promise={1}', this.#id, promise.semaphore);
			this.#counter.failed ++;
			// NOTE: since the returned promise may have its own catch-callback we need to add this execution 
			// to the eventloop in order to have the semaphore failed after it
			setTimeout(() => {
				this.#reject(ex);
			}, 0);
			throw ex;
		});
	}

	/** Allows to register a callback that is executed when the monitored promises are resolved */
	then(callback) {
		logger.debug('Registering then-callback. semaphore={0}', this.#id);
		return this.#deferred.then(callback);
	}

	/** Allows to register a callback that is executed if one of the promises fail */
	catch(callback) {
		logger.debug('Registering catch-callback. semaphore={0}', this.#id);
		return this.#deferred.catch(callback);
	}

	/** Allows to determine if any promise has been binded to the semaphore */
	isBinded() {
		return this.#counter.binded > 0;
	}

	/** Allows to determine if all the binded promises has been completed, independently if were resolved or failed */
	isCompleted() {
		return this.isBinded() && (this.#counter.resolved + this.#counter.failed) === this.#counter.binded;
	}

	/** Allows to determine if all binded promises has been resolved */
	isResolved() {
		return this.isCompleted() && this.#counter.resolved === this.#counter.binded;
	}

	/** Allows to determine if any promise has been failed */
	isFailed() {
		return this.isBinded() && this.#counter.failed > 0;
	}
}

/**
 * Creates a new semaphore instance.  A semaphore allows to bind promises dinamically to monitor its fulfilling.
 */
$module.semaphore = function() {
	return new Semaphore();
};

export default $module;