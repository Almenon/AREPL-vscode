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

import * as assert from "assert";
import vscodeUtilities from '../src/vscodeUtilities'
import { sep } from 'path';

describe('vscode utilities tests', ()=>{

    it('eol as string', ()=>{
        const d = new vscodeMock.TextDocument("", "")
        assert.strictEqual(vscodeUtilities.eol(<any>d), "\n")

        d.eol = 2
        assert.strictEqual(vscodeUtilities.eol(<any>d), "\r\n")
    })

    describe('expand path setting', () => {
        it('should replace env vars', () => {
            process.env["foo2435"] = "a"
            assert.strictEqual(vscodeUtilities.expandPathSetting("${env:foo2435}"), "a")
            delete process.env["foo2435"]
        });

        it('should replace workspacefolder', () => {
            const originalWorkspaceFolders = vscodeMock.workspace.workspaceFolders
            assert.strictEqual(vscodeUtilities.expandPathSetting("${workspaceFolder}/foo"), "root/foo")
        });

        it('should make relative paths absolute', () => {
            assert.strictEqual(vscodeUtilities.expandPathSetting(`foo${sep}.env`), `root${sep}foo${sep}.env`)
        });
        
        it('should not change absolute paths', () => {
            assert.strictEqual(vscodeUtilities.expandPathSetting(__dirname), __dirname)
        });
    });

})