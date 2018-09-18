//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
import * as assert from "assert";
import * as vscode from "vscode";

import {PreviewContainer} from "../src/previewContainer"
import Reporter from "../src/telemetry";

suite("Extension Tests", () => {

    const arepl = vscode.extensions.getExtension("almenon.arepl")!;

    const mockContext: any = {
        asAbsolutePath: (file: string)=>{
            return __dirname + "/" + file
        },
        extensionPath: arepl.extensionPath,
    }

    const doc = new PreviewContainer(new Reporter(false), mockContext, 0);
    const panel = doc.start()


    // this test causes others to fail. Commenting this out untill I fix it
    // test("command activates", (done) => {
    //     vscode.commands.executeCommand("extension.newAREPLSession").then((p) => {
    //         // what we SHOULD be doing here is getting a promise from the command
    //         // and asserting once the promise is resolved
    //         // but despite returning a promise it comes in as undefined... ugggg
    //         // assert.equal(vscode.window.activeTextEditor, true, "command failed to create new file")
    //         assert.ok(true);
    //         done();
    //     }, reason => {
    //         done(reason);
    //     })
    // });

    // THIS MUST BE FIRST TEST
    test("landing page displayed", function(){
        assert.equal(panel.webview.html.includes("Start typing or make a change and your code will be evaluated."), 
                    true, panel.webview.html);
    });

    test("print", function(){
        doc.handlePrint("hello world");
        assert.equal(panel.webview.html.includes("hello world"), true, panel.webview.html);
    });

    test("spawn error", function(){
        doc.handleSpawnError("python3", "C:\\dev\\python","error")
        assert.equal(panel.webview.html.includes("Error in the AREPL extension"), true, panel.webview.html);
    });

    test("error", function(){
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
        assert.equal(panel.webview.html.includes("yo"), true, panel.webview.html);
    });

    test("userVariables", function(){
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
        assert.equal(panel.webview.html.includes('"x":5'), true, panel.webview.html);
    });

    test("print escapes panel.webview.html", function(){
        doc.handlePrint("<module>")
        assert.equal(panel.webview.html.includes("&lt;module&gt;"), true, panel.webview.html);
    });

});