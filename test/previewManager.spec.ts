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
import PreviewManager from '../src/PreviewManager'
import { sep } from 'path';
import { EOL } from 'os';

suite('previewManager tests', function(){

    const mockContext: any = {
        asAbsolutePath: (file: string)=>{
            return __dirname + "/" + file
        },
        extensionPath: "",
    }

    test('does not shows warning for current python version', function(done){
        const p = new PreviewManager(mockContext)
        vscodeMock.window.showErrorMessage = ()=>{
            done("Failed!")
        }
        const pythonPath = process.platform != "win32" ? "python3" : "py"
        //@ts-ignore
        p.warnIfOutdatedPythonVersion(pythonPath)
        this.setTimeout(done, 2000)
    })
})