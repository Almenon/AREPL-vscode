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
import PythonInlinePreview from '../src/pythonInlinePreview'
import { UserError } from 'arepl-backend';

suite('inline preview', ()=>{

    const context: any = {
        'asAbsolutePath': (path)=>{}
    }

    test('shows one error if just one error', ()=>{
        let p = new PythonInlinePreview(null, context);

        const error: UserError = {
            __cause__: null,
            __context__: null,
            _str: "",
            cause: null,
            context: null,
            exc_traceback: {},
            exc_type: {
                "py/type": "ValueError"
            },
            stack: {
                "py/seq": [{
                    _line: "raise ValueError()",
                    filename: "<string>",
                    lineno: 1,
                    locals: {},
                    name: "foo"
                }]
            }
        }

        vscodeMock.window.activeTextEditor.setDecorations = (decorationType, rangesOrOptions: any[])=>{
            assert.strictEqual(rangesOrOptions.length, 1)
        }
        p.showInlineErrors(error, "")

    })

    test('shows multiple errors if more than one', ()=>{
        let p = new PythonInlinePreview(null, context);

        const error: UserError = {
            __cause__: null,
            __context__: null,
            _str: "",
            cause: null,
            context: null,
            exc_traceback: {},
            exc_type: {
                "py/type": "ValueError"
            },
            stack: {
                "py/seq": [{
                    _line: "raise ValueError()",
                    filename: "<string>",
                    lineno: 1,
                    locals: {},
                    name: "foo"
                }]
            }
        }
        // deep-copy error to avoid infinite recursion
        error.__cause__ = JSON.parse(JSON.stringify(error));

        vscodeMock.window.activeTextEditor.setDecorations = (decorationType, rangesOrOptions: any[])=>{
            assert.strictEqual(rangesOrOptions.length, 2)
        }
        p.showInlineErrors(error, "")

    })

})