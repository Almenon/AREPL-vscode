//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
import * as assert from "assert";
import vscodeUtils from '../../src/vscodeUtilities'
import * as vscode from "vscode";

suite("Utility Tests", () => {

    test("new python doc", function(done){
        vscodeUtils.newUnsavedPythonDoc("test").then((editor)=>{
            assert.equal(editor.document.isClosed, false)
            assert.equal(editor.document.getText(), "test")
            vscode.commands.executeCommand("workbench.action.closeActiveEditor").then(()=>{
                done()
            })
        })
    });

    // test("get highlighted text", function(){
    //     Utilities.newUnsavedPythonDoc("testGetHighlightedText").then((editor)=>{
    //         // not sure how to highlight text :/
    //         assert.equal(Utilities.getHighlightedText(), "testGetHighlightedText")
    //     })
    // })

});