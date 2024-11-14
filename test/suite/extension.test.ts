import * as assert from "assert";
import * as vscode from "vscode";

// suite("extension tests", function(){
//     test("command activates", (done) => {
//         console.log('starting');
//         vscode.commands.executeCommand("extension.newAREPLSession").then(() => {
//             // what we SHOULD be doing here is getting a promise from the command
//             // and asserting once the promise is resolved
//             // but despite returning a promise it comes in as undefined... ugggg
//             // so instead we just blindly assume arepl will open in 500ms

//             setTimeout(()=>{
//                 // for some reason the editor opened is not active :(
//                 // assert.strictEqual(vscode.window.activeTextEditor, true, "command failed to create new file")
//                 const default_import_insert = "from arepl_dump import dump"
//                 // I'm assuming newest doc is last item in list
//                 const newest_doc = vscode.window.visibleTextEditors.slice(-1)[0]
//                 assert.strictEqual(newest_doc.document.getText().trim(), default_import_insert)
//                 // we need to close editor to close arepl and have clean state for next test
//                 // however, vscode's API doesn't provide a way to close the editor :O
//                 // see https://github.com/microsoft/vscode/issues/109996
//             }, 500)
//         }, reason => {
//             done(reason);
//         })
//      });
// })