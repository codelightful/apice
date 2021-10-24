#!/usr/bin/env node
'use strict'

const { exec } = require('child_process');
const fs = require('fs').promises;

/** Executes a shell command */
function runCommand(command) {
	return new Promise(function(resolve, reject) {
		exec(command, function(error, stdout, stderror) {
			if(error) {
				reject(error);
				return;
			} else if(stderror) {
				reject(stderror);
				return;
			}
			stdout = stdout.replace('\r', '');
			stdout = stdout.replace('\n', '');
			resolve(stdout);
		});
	});
}

/** Extracts the current version from the NPM package metadata */
function getCurrentVersion() {
	return runCommand('node -p "require(\'./package.json\').version"');
}

/** Updates the file that contains the version in JSON format */
async function updateJson() {
	const version = await getCurrentVersion();
	if(!version) {
		console.error('No version was obtained from the shell. The version.json file cannot be updated');
		return;
	}
	const parts = version.split('.');
	const content = 'export default ' + JSON.stringify({ 
		major: parseInt(parts[0]), 
		minor: parseInt(parts[1]), 
		patch: parseInt(parts[2])
	});
	fs.writeFile('./src/version.mjs', content, 'utf-8');
}

async function main(args) {
	if(args[0] === 'sync') {
		console.log('Synching the current version into version.json');
		updateJson();
	} else if(args[0] === 'info') {
		const version = await getCurrentVersion();
		console.log(version);
	}
}

main(process.argv.splice(2));