import { strict as assert } from 'assert';
await import('./setup/initialize.mjs');
const apice = (await import('../src/apice.mjs')).default;

describe('Base Test', function() {
	it('Checking string version', function() {
		const version = apice.version();
		assert.equal(version, `v${process.env.npm_package_version}`, 'Incorrect version value');
	});

	it('Checking object version', function() {
		const version = apice.version(true);
		const packageVersion = process.env.npm_package_version.split('.');
		assert.equal(version.major, parseInt(packageVersion[0]), `Major version is wrong. expected=${packageVersion[0]} actual=${version.major}`);
		assert.equal(version.minor, parseInt(packageVersion[1]), `Minor version is wrong. expected=${packageVersion[1]} actual=${version.minor}`);
		assert.equal(version.patch, parseInt(packageVersion[2]), `Patching version is wrong. expected=${packageVersion[2]} actual=${version.patch}`);
	});

	it('API Structure', function() {
		assert.ok(apice.logging, 'Missed module: logging');
		assert.ok(apice.util, 'Missed module: util');
		assert.ok(apice.events, 'Missed module: events');
		assert.ok(apice.element, 'Missed module: element');
		assert.ok(apice.cookies, 'Missed module: cookies');
		assert.ok(apice.http, 'Missed module: http');
		assert.ok(apice.controller, 'Missed module: controller');
		assert.ok(apice.fragment, 'Missed module: fragment');
		assert.ok(apice.router, 'Missed module: router');
		assert.ok(apice.error, 'Missed module: error');
		assert.ok(apice.ui, 'Missed module: ui');
	});
});
