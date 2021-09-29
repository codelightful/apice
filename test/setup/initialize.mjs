import jsdom from 'jsdom';
import tap from 'tap';

console.log('Preparing virtual DOM');
const dom = new jsdom.JSDOM();
global.window = dom.window;
global.document = window.document;

tap.before(async () => {
	const apice = await import('../../src/apice.mjs');
	global.Apice = apice.default;
});