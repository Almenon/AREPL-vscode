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

// these tests haven't been going well 
// should try looking into sinon
// if that doesn't work try switching to jest

import * as assert from "assert";
import vscodeUtilities from '../src/vscodeUtilities'
import { sep } from 'path';
import { EOL } from 'os';

suite('vscode utilities tests', ()=>{

    test('eol as string', ()=>{
        const d = new vscodeMock.TextDocument("", "")
        assert.strictEqual(vscodeUtilities.eol(<any>d), "\n")

        d.eol = 2
        assert.strictEqual(vscodeUtilities.eol(<any>d), "\r\n")
    })

    suite('expand path setting', () => {
        test('should replace env vars', () => {
            process.env["foo2435"] = "a"
            assert.strictEqual(vscodeUtilities.expandPathSetting("${env:foo2435}"), "a")
            delete process.env["foo2435"]
        });

        test('should replace workspacefolder', () => {
            assert.strictEqual(vscodeUtilities.expandPathSetting("${workspaceFolder}"), "root")
        });

        test('should make relative paths absolute', () => {
            assert.strictEqual(vscodeUtilities.expandPathSetting(`foo${sep}.env`), `root${sep}foo${sep}.env`)
        });
        
        test('should not change absolute paths', () => {
            assert.strictEqual(vscodeUtilities.expandPathSetting(__dirname), __dirname)
        });
    });

    // get bizarre error with this one
    // bad option: --extensionTestsPath=c:\dev\AREPL-vscode\test\suite\index
    // can't even run it
    // suite('new unsaved python doc', () => {
    //     it('should return a doc', (done) => {
    //         vscodeUtilities.newUnsavedPythonDoc().then((doc)=>{
    //             assert.strictEqual(doc, 1)
    //             done()
    //         })
    //     });
    // });

})