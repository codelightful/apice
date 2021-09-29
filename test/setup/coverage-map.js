module.exports = function (testFile) {
	if(testFile === 'test/base.test.mjs') {
		return 'src/apice.mjs';
	}
	return testFile;
};
