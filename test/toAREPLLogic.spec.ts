import { EOL } from "os";
import * as assert from "assert";

//////////////////////////////////////////////
// below thanks to https://github.com/rokucommunity/vscode-brightscript-language
let Module = require('module');
import { vscodeMock } from './mockVscode.spec';
//override the "require" call to mock certain items
const { require: oldRequire } = Module.prototype;
Module.prototype.require = function hijacked(file) {
    if (file === 'vscode') {
        return vscodeMock;
    } else {
        return oldRequire.apply(this, arguments);
    }
};
//////////////////////////////////////////////

import {ToAREPLLogic} from '../src/toAREPLLogic'

suite("toAREPLLogic tests", ()=>{

    const mockPythonExecutor: any = {
        execCode: ()=>{}
    }

    const toAREPLLogic = new ToAREPLLogic(mockPythonExecutor, null);

    test("arepl not ran when just end section is changed", function(){
        let returnVal = toAREPLLogic.onUserInput(`#$end${EOL}bla`, "", EOL)
        assert.strictEqual(returnVal, true)
        returnVal = toAREPLLogic.onUserInput(`#$end${EOL}foo`, "", EOL)
        assert.strictEqual(returnVal, false)
    });

    test("unsafe keyword not allowed", function(){
        assert.strictEqual(toAREPLLogic.scanForUnsafeKeywords("os.rmdir('bla')", ["rmdir"]), true)
    });

    test("safe keyword allowed", function(){
        assert.strictEqual(toAREPLLogic.scanForUnsafeKeywords("bla bla bla", ["rmdir"]), false)
    });

    test("unsafe keyword allowed in comment", function(){
        assert.strictEqual(toAREPLLogic.scanForUnsafeKeywords("#rmdir", ["rmdir"]), false)
    });

    test("unsafe keywords not allowed", function(){
        assert.strictEqual(toAREPLLogic.scanForUnsafeKeywords("DELETE * FROM", ["rmdir","DELETE"]), true)
    });
})