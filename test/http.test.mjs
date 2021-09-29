import tap from 'tap';
await import('./setup/initialize.mjs');

tap.test('HTTP basic contract', async test => {
	test.ok(Apice.http);
	test.equal(typeof (Apice.http.request), 'function');
	test.end();
});

tap.test('HTTP request with a null URL should throw Exception', async test => {
	Apice.http.request().catch(ex => {
		test.end();
	});
});

//tap.test('HTTP request without options should execute a GET request by default', async test => {
//	Apice.http.request('');
//	test.end();
//});
