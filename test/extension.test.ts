//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
import * as assert from 'assert';
import * as vscode from 'vscode';

import * as myExtension from '../src/extension';
import HTMLDocumentContentProvider from '../src/HTMLDocumentContentProvider'

suite("Extension Tests", () => {
    
    let mockContext: any = {
        'asAbsolutePath': (file:string)=>{
            return __dirname + '/' + file
        }
    }

    // very odd problem with my tests where if the assert fails done is never reached and it times out
    // todo: fix that crap

    test("print", (done) => {
        let doc = new HTMLDocumentContentProvider(mockContext);
        doc.onDidChange((x)=>{
            let html = doc.provideTextDocumentContent(null);
            assert.equal(html.includes("hello world"), true, html);
            done()
        })
        doc.handlePrint("hello world")
    });

    test("print escapes html", (done) => {
        let doc = new HTMLDocumentContentProvider(mockContext);
        doc.onDidChange((x)=>{
            let html = doc.provideTextDocumentContent(null);
            assert.equal(html.includes("&lt;module&gt;"), true, html);
            done()
        })
        doc.handlePrint("<module>")
    });

});