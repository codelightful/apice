import { strict as assert } from 'assert';
import withMockedConsole from './setup/console-mocker.mjs';
await import('./setup/initialize.mjs');
const apice = (await import('../src/apice.mjs')).default;

describe('Cookies', function() {
	it('Unset cookie should produce null', function() {
		const value = apice.cookies.get('some-unset-cookie');
		assert.equal(value, null, 'A unset cookie value should be null');
	});

	it('Cookie without name should produce null', function() {
		const value = apice.cookies.get();
		assert.equal(value, null, 'A cookie value without name should be null');
	});

	it('Validating cookie values when is properly set', withMockedConsole(function(entries) {
		apice.cookies.set('cookie-a', 'aaa', 5);
		apice.cookies.set('cookie-b', 'bbb');
		const cookieA = apice.cookies.get('cookie-a');
		const cookieB = apice.cookies.get('cookie-b');
		assert.equal(cookieA, 'aaa', 'The cookie does not match the expected value');
		assert.equal(cookieB, 'bbb', 'The cookie does not match the expected value');
		// a warning should be produced because the cookie-b did not receive a timespan
		assert.strictEqual(entries.length, 1, 'A warning should be produced to collect timespan warnings');
	}));

	it('An expired cookie should produce null value', function(done) {
		apice.cookies.set('cookie-expired', 'expired-value', 0.01);
		setTimeout(function() {
			const value = apice.cookies.get('cookie-expired');
			assert.equal(value, null, `An expired cookie produced a value. value=${value}`);
			done();
		}, 20);
	});

	it('Setting a cookie without name', withMockedConsole(function(entries) {
		apice.cookies.set();
		// a warning should be produced because the cookie set function was called without a name
		assert.strictEqual(entries.length, 1, 'A warning should be produced when cookie set method is invoked without argument');
	}));
});
