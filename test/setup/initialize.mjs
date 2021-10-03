import jsdom from 'jsdom';

console.log('Preparing virtual DOM');
const dom = new jsdom.JSDOM();
global.window = dom.window;
global.document = window.document;
