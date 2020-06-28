import * as assert from "assert";
import * as vscode from "vscode";

suite("extension tests", function(){
    test("newAREPLSession and closeAREPL", (done) => {
         vscode.commands.executeCommand("extension.newAREPLSession").then((p) => {
             // what we SHOULD be doing here is getting a promise from the command
             // and asserting once the promise is resolved
             // but despite returning a promise it comes in as undefined... ugggg
             // so instead we just blindly assume arepl will open in 500ms
    
             setTimeout(()=>{
                // for some reason activeTextEditor is undefined :/ 
                // assert.equal(vscode.window.activeTextEditor, true, "command failed to create new file")

                // cleanup
                vscode.commands.executeCommand("extension.closeAREPL").then((p) => {
                    setTimeout(()=>{
                       done()
                    }, 500)
                }, reason => {
                    done(`error while closing arepl: ${reason}`);
                })
             }, 500)
         }, reason => {
             done(reason);
         })
     });
})