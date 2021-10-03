import { strict as assert } from 'assert';
import withMockedConsole from './setup/console-mocker.mjs';
await import('./setup/initialize.mjs');
const apice = (await import('../src/apice.mjs')).default;

function testLogLevel(level, label, color) {
	return withMockedConsole(function(entries) {
		const logger = apice.logging.getLogger('logger-01');
		assert.equal(typeof(logger[level]), 'function', `Missing ${level} method`);
		apice.logging.level(level);
		// simple message
		logger[level](`Log entry (${level})`);
		assert.equal(entries.pop(), `%c[${label}][logger-01]: Log entry (${level}) ["color: ${color}"]`);
		// message with placeholders but no values
		logger[level](`Log entry (${level}) a={0} b={1}`);
		assert.equal(entries.pop(), `%c[${label}][logger-01]: Log entry (${level}) a={0} b={1} ["color: ${color}"]`);
		// message with placeholders
		logger[level](`Log entry (${level}) a={0} b={1} c={0} d={2}`, 'AAA', 'BBB');
		assert.equal(entries.pop(), `%c[${label}][logger-01]: Log entry (${level}) a=AAA b=BBB c=AAA d={2} ["color: ${color}"]`);
		// message with data and placeholders
		logger[level](`Log entry (${level}) a={0} b={1} c={0}`, 'AAA', 'BBB', { one: '1', two: '2' });
		assert.equal(entries.pop(), `%c[${label}][logger-01]: Log entry (${level}) a=AAA b=BBB c=AAA ["color: ${color}",{"one":"1","two":"2"}]`);
		// object
		logger[level]({ value: 'xxxx' });
		assert.equal(entries.pop(), `%c[${label}][logger-01]: {"value":"xxxx"} ["color: ${color}"]`);
	})
}

describe('Logging', function() {
	it('Getting default system logger', function() {
		const logger = apice.logging.getLogger();
		assert.ok(logger);
		assert.strictEqual(logger.name, 'system');
	});

	it('Getting loggers', function() {
		const logger1 = apice.logging.getLogger('logger-01');
		const logger2 = apice.logging.getLogger('logger-02');
		const logger3 = apice.logging.getLogger('logger-01');
		assert.ok(logger1, 'A logger instance was not produced');
		assert.ok(logger2, 'A logger instance was not produced');
		assert.ok(logger3, 'A logger instance was not produced');
		assert.strictEqual(logger1, logger3, 'The logger is producing a different instance for the same logger name');
		assert.notStrictEqual(logger1, logger2, 'The logger is producing the same instance for different names');
	});

	it('Logger fatal', testLogLevel('fatal', 'FATAL', '#ff4444'));
	it('Logger error', testLogLevel('error', 'ERROR', '#ff4444'));
	it('Logger warning', testLogLevel('warn', 'WARN', '#ff8800'));
	it('Logger info', testLogLevel('info', 'INFO', '#0099cc'));
	it('Logger debug', testLogLevel('debug', 'DEBUG', '#3E4551'));
	it('Logger trace', testLogLevel('trace', 'TRACE', '#3E4551'));

	it('Setting global log level', function() {
		const logger1 = apice.logging.getLogger('logger-01');
		const logger2 = apice.logging.getLogger('logger-02');

		apice.logging.level('trace');
		assert.strictEqual(apice.logging.level(), 'TRACE');
		assert.strictEqual(logger1.level(), 'TRACE');
		assert.strictEqual(logger2.level(), 'TRACE');

		apice.logging.level('debug');
		assert.strictEqual(apice.logging.level(), 'DEBUG');
		assert.strictEqual(logger1.level(), 'DEBUG');
		assert.strictEqual(logger2.level(), 'DEBUG');

		apice.logging.level('info');
		assert.strictEqual(apice.logging.level(), 'INFO');
		assert.strictEqual(logger1.level(), 'INFO');
		assert.strictEqual(logger2.level(), 'INFO');

		apice.logging.level('warn');
		assert.strictEqual(apice.logging.level(), 'WARN');
		assert.strictEqual(logger1.level(), 'WARN');
		assert.strictEqual(logger2.level(), 'WARN');

		apice.logging.level('error');
		assert.strictEqual(apice.logging.level(), 'ERROR');
		assert.strictEqual(logger1.level(), 'ERROR');
		assert.strictEqual(logger2.level(), 'ERROR');

		apice.logging.level('fatal');
		assert.strictEqual(apice.logging.level(), 'FATAL');
		assert.strictEqual(logger1.level(), 'FATAL');
		assert.strictEqual(logger2.level(), 'FATAL');
	});

	it('Setting wrong global log level', function() {
		// sets an initial valid level
		apice.logging.level('warn');
		// sets the wrong level
		assert.throws(function() {
			apice.logging.level('invalid');
		}, 'An error should be throw when an invalid log level is set');
		// validate the level has not changed
		assert.strictEqual(apice.logging.level(), 'WARN');	
	});

	it('Setting specific log level', function() {
		const logger1 = apice.logging.getLogger('logger-01');
		const logger2 = apice.logging.getLogger('logger-02');

		apice.logging.level('fatal');
		apice.logging.level('trace', 'logger-02');
		assert.strictEqual(logger1.level(), 'FATAL');
		assert.strictEqual(logger2.level(), 'TRACE');

		apice.logging.level('error');
		apice.logging.level('debug', 'logger-02');
		assert.strictEqual(logger1.level(), 'ERROR');
		assert.strictEqual(logger2.level(), 'DEBUG');

		apice.logging.level('warn');
		apice.logging.level('info', 'logger-02');
		assert.strictEqual(logger1.level(), 'WARN');
		assert.strictEqual(logger2.level(), 'INFO');

		apice.logging.level('info');
		apice.logging.level('warn', 'logger-02');
		assert.strictEqual(logger1.level(), 'INFO');
		assert.strictEqual(logger2.level(), 'WARN');

		apice.logging.level('debug');
		apice.logging.level('error', 'logger-02');
		assert.strictEqual(logger1.level(), 'DEBUG');
		assert.strictEqual(logger2.level(), 'ERROR');

		apice.logging.level('trace');
		apice.logging.level('fatal', 'logger-02');
		assert.strictEqual(logger1.level(), 'TRACE');
		assert.strictEqual(logger2.level(), 'FATAL');
	});

	it('Setting wrong specific log level', function() {
		const logger1 = apice.logging.getLogger('logger-01');
		// sets an initial valid level
		apice.logging.level('info', 'logger-01');
		// sets the wrong level
		assert.throws(function() {
			apice.logging.level('invalid', 'logger-01');
		}, 'An error should be throw when an invalid log level is set');
		// validate the level has not changed
		assert.strictEqual(logger1.level(), 'INFO');	
	});
});
