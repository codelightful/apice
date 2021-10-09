import { strict as assert } from 'assert';
await import('./setup/initialize.mjs');
const apice = (await import('../src/apice.mjs')).default;

describe('Element', function() {
	beforeEach(function() {
		document.body.innerHTML = '<div id="top-element" class="top-container">INITIAL</div>';
		// validate the DOM is working as expected
		assert.ok(document.getElementById('top-element'));
		assert.ok(document.querySelector('.top-container'));
	});

	it('Element from body', function() {
		const element1 = apice.element('body');
		assert.ok(element1, 'The body element should produce a valid instance');
		const element2 = apice.element(document.body);
		assert.strictEqual(element1, element2, 'The body element should be a singleton');
	});

	it('Extract element without arguments', function() {
		const value = apice.element();
		assert.strictEqual(value, null, 'No element should be returned for an undefined selector');
	});

	it('Extract element with null selector', function() {
		const value = apice.element(null);
		assert.strictEqual(value, null, 'No element should be returned for a null selector');
	});

	it('Extract non-existing selector', function() {
		const value = apice.element('something');
		assert.strictEqual(value, null, 'No element should be returned for a non-existing selector');
	});

	it('Extract element from ID selector', function() {
		const elem = apice.element('#top-element');
		assert.ok(elem, 'The API was not able to find the element');
		// validate the element API contract
		assert.strictEqual(typeof(elem.content), 'function', 'Missing content method');
		assert.strictEqual(typeof(elem.each), 'function', 'Missing each method');
		assert.strictEqual(typeof(elem.append), 'function', 'Missing append method');
		assert.strictEqual(typeof(elem.prepend), 'function', 'Missing prepend method');
		assert.strictEqual(typeof(elem.on), 'function', 'Missing on method');
		// validate is the expected element
		assert.strictEqual(elem.id, 'top-element');
	});

	it('Extract element from CLASS selector', function() {
		const elem = apice.element('.top-container');
		assert.ok(elem, 'The API was not able to find the element');
		// validate is the expected element
		assert.strictEqual(elem.id, 'top-element');
	});

	it('Extract element from HTMLElement', function() {
		const domElem = document.getElementById('top-element');
		assert.ok(domElem, 'The DOM element was not found');
		const elem = apice.element(domElem);
		assert.ok(elem, 'The API was not able to find the element');
		// validate is the expected element
		assert.strictEqual(elem.id, 'top-element');
	});

	it('Extract element from Apice element instance', function() {
		const apiceElem = apice.element('#top-element');
		const elem = apice.element(apiceElem);
		assert.ok(elem, 'The API was not able to find the element');
		// validate is the expected element
		assert.strictEqual(elem.id, 'top-element');
		assert.strictEqual(elem, apiceElem, 'A new element instance was created');
	});

	it('Set and get null content', function() {
		const elem = apice.element('#top-element');
		elem.content(null);
		assert.strictEqual(elem.content(), '', 'The element content was not changed using null value');
		assert.strictEqual(document.getElementById('top-element').innerHTML, '', 'The DOM content was not changed');
	});

	it('Set and get string content', function() {
		const elem = apice.element('#top-element');
		elem.content('SOMETHING ELSE');
		assert.strictEqual(elem.content(), 'SOMETHING ELSE', 'The element content was not changed');
		assert.strictEqual(document.getElementById('top-element').innerHTML, 'SOMETHING ELSE', 'The DOM content was not changed');
	});

	it('Set and get HTMLElement content', function() {
		const elem = apice.element('#top-element');
		const domElem = document.createElement('div');
		domElem.innerHTML = 'SOME CONTENT';
		elem.content(domElem);
		assert.strictEqual(elem.content(), '<div>SOME CONTENT</div>', 'The element content was not changed');
		assert.strictEqual(document.getElementById('top-element').innerHTML, '<div>SOME CONTENT</div>', 'The DOM content was not changed');
	});

	it('Set and get Apice element content', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = '<div id="div-01">CONTENT-A</div><div id="div-02">CONTENT-B</div>';
		const child = apice.element('#div-01');
		const elem = apice.element('#top-element');
		elem.content(child);
		assert.strictEqual(elem.content(), '<div id="div-01">CONTENT-A</div>', 'The element content was not changed');
		assert.strictEqual(top.innerHTML, '<div id="div-01">CONTENT-A</div>', 'The DOM content was not changed');
	});

	it('Append string', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = 'THE LITTLE LAMB';
		const elem = apice.element('#top-element');
		elem.append(' FOLLOWED MARY EVERYWHERE');
		assert.strictEqual(elem.content(), 'THE LITTLE LAMB FOLLOWED MARY EVERYWHERE', 'The string was NOT appended to the element content');
		assert.strictEqual(document.getElementById('top-element').innerHTML, 'THE LITTLE LAMB FOLLOWED MARY EVERYWHERE', 'The string was NOT apended to the DOM element');
	});

	it('Append HTMLElement', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = '<div>CONTENT-01</div>';
		const another = document.createElement('div');
		another.innerHTML = 'CONTENT-02';
		const elem = apice.element('#top-element');
		elem.append(another);
		assert.strictEqual(elem.content(), '<div>CONTENT-01</div><div>CONTENT-02</div>', 'The HTMLElement was NOT appended to the element content');
		assert.strictEqual(document.getElementById('top-element').innerHTML, '<div>CONTENT-01</div><div>CONTENT-02</div>', 'The HTMLElement was NOT apended to the DOM element');
	});

	it('Append Apice element', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = '<div id="div-02">CONTENT-02</div><div id="div-01">CONTENT-01</div>';
		const another = apice.element('#div-02');
		const elem = apice.element('#top-element');
		elem.append(another);
		assert.strictEqual(elem.content(), '<div id="div-01">CONTENT-01</div><div id="div-02">CONTENT-02</div>', 'The Apice element was NOT appended to the element content');
		assert.strictEqual(document.getElementById('top-element').innerHTML, '<div id="div-01">CONTENT-01</div><div id="div-02">CONTENT-02</div>', 'The Apice element was NOT apended to the DOM element');
	});

	it('Prepend string', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = 'FOLLOWED MARY EVERYWHERE';
		const elem = apice.element('#top-element');
		elem.prepend('THE LITTLE LAMB ');
		assert.strictEqual(elem.content(), 'THE LITTLE LAMB FOLLOWED MARY EVERYWHERE', 'The string was NOT appended to the element content');
		assert.strictEqual(document.getElementById('top-element').innerHTML, 'THE LITTLE LAMB FOLLOWED MARY EVERYWHERE', 'The string was NOT apended to the DOM element');
	});

	it('Prepend HTMLElement', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = '<div>CONTENT-02</div>';
		const another = document.createElement('div');
		another.innerHTML = 'CONTENT-01';
		const elem = apice.element('#top-element');
		elem.prepend(another);
		assert.strictEqual(elem.content(), '<div>CONTENT-01</div><div>CONTENT-02</div>', 'The HTMLElement was NOT appended to the element content');
		assert.strictEqual(document.getElementById('top-element').innerHTML, '<div>CONTENT-01</div><div>CONTENT-02</div>', 'The HTMLElement was NOT apended to the DOM element');
	});

	it('Prepend Apice element', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = '<div id="div-02">CONTENT-02</div><div id="div-01">CONTENT-01</div>';
		const another = apice.element('#div-01');
		const elem = apice.element('#top-element');
		elem. prepend(another);
		assert.strictEqual(elem.content(), '<div id="div-01">CONTENT-01</div><div id="div-02">CONTENT-02</div>', 'The Apice element was NOT appended to the element content');
		assert.strictEqual(document.getElementById('top-element').innerHTML, '<div id="div-01">CONTENT-01</div><div id="div-02">CONTENT-02</div>', 'The Apice element was NOT apended to the DOM element');
	});

	it('Set content on multiple elements', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = '<div class="box"></div><div class="box"></div>';
		const elements = apice.element('.box');
		elements.content('CONTENT');
		assert.strictEqual(document.getElementById('top-element').innerHTML, '<div class="box">CONTENT</div><div class="box">CONTENT</div>', 'The DOM content was not changed');
	});

	it('Get content from multiple elements', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = '<div class="box">AAA</div><div class="box">BBB</div>';
		const elements = apice.element('.box');
		const content = elements.content();
		assert.deepStrictEqual(content, ['AAA', 'BBB'], 'The content for multiple elements is wrong');
	});

	it('Append on multiple elements', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = '<div class="box">AB</div><div class="box">AB</div>';
		const elements = apice.element('.box');
		elements.append('CD');
		assert.strictEqual(document.getElementById('top-element').innerHTML, '<div class="box">ABCD</div><div class="box">ABCD</div>', 'The DOM content was not changed');
	});

	it('Prepend on multiple elements', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = '<div class="box">CD</div><div class="box">CD</div>';
		const elements = apice.element('.box');
		elements.prepend('AB');
		assert.strictEqual(document.getElementById('top-element').innerHTML, '<div class="box">ABCD</div><div class="box">ABCD</div>', 'The DOM content was not changed');
	});

	it('Static append with no arguments', function() {
		assert.doesNotThrow(() => {
			apice.element.append();
		});
	});

	it('Static append with null target', function() {
		assert.doesNotThrow(() => {
			apice.element.append(null, '#top-element');
		});
	});

	it('Static append with null source', function() {
		assert.doesNotThrow(() => {
			apice.element.append('#top-element', null);
		});
	});

	it('Static append using body as the source', function() {
		assert.throws(() => {
			apice.element.append('#top-element', 'body');
		}, {
			message: /source_cannot_be_body/
		});
		assert.throws(() => {
			apice.element.append('#top-element', document.body);
		}, {
			message: /source_cannot_be_body/
		});
	});

	it('Static append using unknown target', function() {
		assert.throws(() => {
			apice.element.append('#some-target', '#top-element');
		}, {
			message: /unknown_target\[\#some\-target\]/
		});
	});

	it('Static append using unknown source', function() {
		assert.throws(() => {
			apice.element.append('#top-element', '#some-source');
		}, {
			message: /unknown_source\[\#some\-source\]/
		});
	});

	it('Static append with selectors', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = '<div id="div-source"></div><div id="div-target"></div>';
		apice.element.append('#div-target', '#div-source');
		assert.strictEqual(top.innerHTML, '<div id="div-target"><div id="div-source"></div></div>');
	});

	it('Static append with HTMLElements', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = '<div id="div-source"></div><div id="div-target"></div>';
		const source = document.getElementById('div-source');
		const target = document.getElementById('div-target');
		apice.element.append(target, source);
		assert.strictEqual(top.innerHTML, '<div id="div-target"><div id="div-source"></div></div>');
	});

	it('Static append with Apice Elements', function() {
		const top = document.getElementById('top-element');
		top.innerHTML = '<div id="div-source"></div><div id="div-target"></div>';
		const source = apice.element('#div-source')
		const target = apice.element('#div-target');
		apice.element.append(target, source);
		assert.strictEqual(top.innerHTML, '<div id="div-target"><div id="div-source"></div></div>');
	});
});
