import * as assert from "assert";
import * as vscode from "vscode";
import PreviewManager from "../../src/PreviewManager"
import vscodeUtils from "../../src/vscodeUtilities";
import { EOL } from "os";

/**
 * this suite tests both PreviewManager and pythonPanelPreview
 * by activating funcs in PreviewManager and looking at html rendered by pythonPanelPreview
 */
suite("PreviewManager and pythonPanelPreview Tests", () => {

    const arepl = vscode.extensions.getExtension("almenon.arepl")!;
    let editor: vscode.TextEditor
    let panel: vscode.WebviewPanel
    let previewManager: PreviewManager

    const mockContext: any = {
        asAbsolutePath: (file: string)=>{
            return __dirname + "/" + file
        },
        extensionPath: arepl.extensionPath,
    }

    suiteSetup(function(done){
        vscodeUtils.newUnsavedPythonDoc("").then((newEditor)=>{
            editor = newEditor
            previewManager = new PreviewManager(mockContext);

            previewManager.startArepl(editor).then((promiseResults)=>{
                panel = promiseResults[0]
                console.log("preview panel started")
                done()
            }).catch((err)=>done(err))
        })
    })

    test("default imports should be inserted", function(){
        assert.strictEqual(editor.document.getText(), "from arepl_dump import dump" + EOL)
    });

    test("webview should be displayed", function(){
        assert.strictEqual(panel.visible, true)
    });

    // todo: fix test (see https://github.com/Almenon/AREPL-vscode/issues/355)
    // test("edits should result in webview change", function(done){
    //     editor.edit(editBuilder => {
    //         editBuilder.insert(new vscode.Position(0,0), "x=3424523;")
    //     }).then(()=>{
    //         setTimeout(()=>{
    //             assert.strictEqual(panel.webview.html.includes(`"x":3424523`), true, panel.webview.html)
    //             done()
    //         },4000)
    //     }, done)
    // });

    suiteTeardown(function(done){
        previewManager.dispose()
        setTimeout(() => {
            vscode.commands.executeCommand("workbench.action.closeActiveEditor").then(()=>{
                done()
            })
        }, 250);
    })

});
