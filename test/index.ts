//
// PLEASE DO NOT MODIFY / DELETE UNLESS YOU KNOW WHAT YOU ARE DOING
//
// This file is providing the test runner to use when running extension tests.
// By default the test runner in use is Mocha based.
//
// You can provide your own test runner if you want to override it by exporting
// a function run(testRoot: string, clb: (error:Error) => void) that the extension
// host can call to run the tests. The test runner is expected to use console.log
// to report the results back to the caller. When the tests are finished, return
// a possible error to the callback or null if none.

import * as testRunner from 'vscode/lib/testrunner';

//@ts-ignore v8debug might be present in debug mode
const debug = typeof v8debug === 'object' 
            || /--debug|--inspect/.test(process.execArgv.join(' '));

// You can directly control Mocha options by uncommenting the following lines
// See https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically#set-options for more info
testRunner.configure({
    ui: 'tdd', // see https://mochajs.org/#tdd and https://github.com/mochajs/mocha/issues/310
    useColors: true, // colored output from test results
    timeout: debug ? 99999999: 6000, // if we are debugging we dont want timeout
});

module.exports = testRunner;