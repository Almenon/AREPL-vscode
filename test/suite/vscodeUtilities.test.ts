import * as assert from "assert";
import vscodeUtils from '../../src/vscodeUtilities'
import * as vscode from "vscode";

suite("Utility Tests", () => {

    test("new python doc", function(done){
        vscodeUtils.newUnsavedPythonDoc("test").then((editor)=>{
            assert.strictEqual(editor.document.isClosed, false)
            assert.strictEqual(editor.document.getText(), "test")
            vscode.commands.executeCommand("workbench.action.closeActiveEditor").then(()=>{
                done()
            })
        })
    });

    // test("get highlighted text", function(){
    //     Utilities.newUnsavedPythonDoc("testGetHighlightedText").then((editor)=>{
    //         // not sure how to highlight text :/
    //         assert.strictEqual(Utilities.getHighlightedText(), "testGetHighlightedText")
    //     })
    // })

});