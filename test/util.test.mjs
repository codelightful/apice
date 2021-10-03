import { strict as assert } from 'assert';
await import('./setup/initialize.mjs');
const apice = (await import('../src/apice.mjs')).default;

describe('Util', function() {
	it('isPromise with no arguments', function() {
		const value = apice.util.isPromise();
		assert.strictEqual(value, false, 'An undefined value should not be considered as a promise');
	});

	it('isPromise with null argument', function() {
		const value = apice.util.isPromise(null);
		assert.strictEqual(value, false, 'An null value should not be considered as a promise');
	});

	it('isPromise with valid Promise argument', function() {
		const value = apice.util.isPromise(Promise.resolve());
		assert.strictEqual(value, true, 'A promise was not properly identified');
	});

	it('trim with no arguments', function() {
		const value = apice.util.trim();
		assert.strictEqual(value, '', 'Trimming undefined should return an empty string');
	});

	it('trim with null argument', function() {
		const value = apice.util.trim(null);
		assert.strictEqual(value, '', 'Trimming a null value should return an empty string');
	});

	it('trim string value', function() {
		const value = apice.util.trim('  a string  ');
		assert.strictEqual(value, 'a string', 'Trimming valid string did not produced a valid result');
	});

	it('trim string value', function() {
		const value = apice.util.trim('  a string  ');
		assert.strictEqual(value, 'a string', 'Trimming valid string did not produced a valid result');
	});

	it('placeholders with no arguments', function() {
		const value = apice.util.placeholders();
		assert.ok(value);
		assert.strictEqual(value.output, undefined, 'Wrong output value. output=' + value.output);
	});

	it('placeholders with null arguments', function() {
		const value = apice.util.placeholders(null);
		assert.ok(value);
		assert.strictEqual(value.output, null, 'Wrong output value. output=' + value.output);
	});

	it('placeholders without values', function() {
		const value = apice.util.placeholders('a={0}, b={1}');
		assert.ok(value);
		assert.strictEqual(value.output, 'a={0}, b={1}', 'Wrong output value. output=' + value.output);
	});

	it('placeholders with null and incomplete values', function() {
		const value = apice.util.placeholders('a={0}, b={1}', null);
		assert.ok(value);
		assert.strictEqual(value.output, 'a=null, b={1}', 'Wrong output value. output=' + value.output);
	});

	it('placeholders with values', function() {
		const value = apice.util.placeholders('a={0}, b={1} c={0}', 'AAA', 'BBB');
		assert.ok(value);
		assert.strictEqual(value.output, 'a=AAA, b=BBB c=AAA', 'Wrong output value. output=' + value.output);
	});

	it('placeholders without source', function() {
		const value = apice.util.placeholders('a={0}, b={}', 'AAA', 'BBB');
		assert.ok(value);
		assert.strictEqual(value.output, 'a=AAA, b={}', 'Wrong output value. output=' + value.output);
	});
});
