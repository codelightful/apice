import { strict as assert } from 'assert';
import random from '../src/random.mjs';

describe('Random', function() {
	it('tinyId', function() {
		const value1 = random.tinyId();
		const value2 = random.tinyId();
		assert.ok(value1);
		assert.ok(value2);
		assert.notStrictEqual(value1, value2, 'Two random values should not be equal');
	});

	it('shortId', function() {
		const value1 = random.shortId();
		const value2 = random.shortId();
		assert.ok(value1);
		assert.ok(value2);
		assert.notStrictEqual(value1, value2, 'Two random values should not be equal');
	});

	it('guid', function() {
		const value1 = random.guid();
		const value2 = random.guid();
		assert.ok(value1);
		assert.ok(value2);
		assert.notStrictEqual(value1, value2, 'Two random values should not be equal');
	});
});
