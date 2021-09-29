import tap from 'tap';
await import('./setup/initialize.mjs');

// execute the basic validations on the expected Apice structure
tap.test('Basic Apice structure', async test => {
	test.ok(Apice);
	test.ok(Apice.http);
	test.end();
});
