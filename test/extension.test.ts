//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
import * as assert from "assert";
import * as vscode from "vscode";

import {PreviewContainer} from "../src/previewContainer" 
import Reporter from "../src/telemetry";

suite("Extension Tests", () => {
    
    const mockContext: any = {
        asAbsolutePath: (file: string)=>{
            return __dirname + "/" + file
        }
    }

    // very odd problem with my tests where if the assert fails done is never reached and it times out
    // todo: fix that crap

    test("command activates", (done) => {
        vscode.commands.executeCommand("extension.newAREPLSession").then(() => {
            // what we SHOULD be doing here is getting a promise from the command 
            // and asserting once the promise is resolved
            // but despite returning a promise it comes in as undefined... ugggg
            // assert.equal(vscode.window.activeTextEditor, true, "command failed to create new file")
            done()
        }, reason => {
            assert.fail("failure executing command! reason: " + reason);
        })
    });

    test("print", (done) => {
        const doc = new PreviewContainer(new Reporter(false), mockContext);
        doc.onDidChange((x) =>{
            const html = doc.provideTextDocumentContent(null);
            assert.equal(html.includes("hello world"), true, html);
            done()
        })
        doc.handlePrint("hello world")
    });

    test("spawn error", (done) => {
        const doc = new PreviewContainer(new Reporter(false), mockContext);
        doc.onDidChange((x)=>{
            const html = doc.provideTextDocumentContent(null);
            assert.equal(html.includes("Error in the AREPL extension"), true, html);
            done()
        })
        doc.handleSpawnError("python3", "C:\\dev\\python","error")
    });

    test("error", (done) => {
        const doc = new PreviewContainer(new Reporter(false), mockContext);
        doc.onDidChange((x) => {
            const html = doc.provideTextDocumentContent(null);
            assert.equal(html.includes("yo"), true, html);
            done()
        })
        doc.handleResult(
            {
                caller: "",
                done: true,
                execTime: 0,
                internalError: "",
                lineno: -1,
                totalPyTime: 0,
                totalTime: 0,
                userError: "yo",
                userVariables: {},
            }
        )
    });

    test("userVariables", (done) => {
        const doc = new PreviewContainer(new Reporter(false), mockContext);
        doc.onDidChange((x) => {
            const html = doc.provideTextDocumentContent(null);
            assert.equal(html.includes("5"), true, html);
            done()
        })
        doc.handleResult(
            {
                caller: "",
                done: true,
                execTime: 0,
                internalError: "",
                lineno: -1,
                totalPyTime: 0,
                totalTime: 0,
                userError: "",
                userVariables: {x: 5},
        }
        )
    });

    test("print escapes html", (done) => {
        const doc = new PreviewContainer(new Reporter(false), mockContext);
        doc.onDidChange((x) => {
            const html = doc.provideTextDocumentContent(null);
            assert.equal(html.includes("&lt;module&gt;"), true, html);
            done()
        })
        doc.handlePrint("<module>")
    });

});