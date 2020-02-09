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

describe('vscode utilities tests', ()=>{

    it('eol as string', ()=>{
        const d = new vscodeMock.TextDocument("", "")
        assert.equal(vscodeUtilities.eol(<any>d), "\n")

        d.eol = 2
        assert.equal(vscodeUtilities.eol(<any>d), "\r\n")
    })

    describe('expand path setting', () => {
        it('should replace env vars', () => {
            process.env["foo2435"] = "a"
            assert.equal(vscodeUtilities.expandPathSetting("${env:foo2435}"), "a")
            delete process.env["foo2435"]
        });

        it('expand path setting', () => {
            const uri = new vscodeMock.Uri("","","a","","")
            vscodeMock.workspace.workspaceFolders = [uri]
            assert.equal(vscodeUtilities.expandPathSetting("${workspaceFolder}/foo"), "a/foo")
            vscodeMock.workspace.workspaceFolders = []
        });
    });

})