import * as assert from "assert";
import * as vscode from "vscode";
import PreviewManager from "../../src/PreviewManager"
import vscodeUtils from "../../src/vscodeUtilities";
import { EOL } from "os";

/**
 * this suite tests both PreviewManager and pythonPreview
 * by activating funcs in PreviewManager and looking at html rendered by pythonPreview
 */
suite("PreviewManager and pythonPreview Integration Tests", () => {

    const arepl = vscode.extensions.getExtension("almenon.arepl")!;
    let editor:vscode.TextEditor
    let panel:vscode.WebviewPanel
    let previewManager: PreviewManager

    const mockContext: any = {
        asAbsolutePath: (file: string)=>{
            return __dirname + "/" + file
        },
        extensionPath: arepl.extensionPath,
    }

    suiteSetup(function(done){
        // existing editor causes weird error for some reason
        vscode.commands.executeCommand("workbench.action.closeActiveEditor").then(()=>{
            vscodeUtils.newUnsavedPythonDoc("").then((newEditor)=>{
                editor = newEditor
                previewManager = new PreviewManager(mockContext);
    
                previewManager.startArepl().then((previewPanel)=>{
                    panel = previewPanel
                    console.log("preview panel started")
                    done()
                }).catch((err)=>done(err))
            })
        })
    })

    test("default imports should be inserted", function(){
        assert.equal(editor.document.getText(), "from arepl_dump import dump" + EOL)
    });

    test("webview should be displayed", function(){
        assert.equal(panel.visible, true)
    });

    test("edits should result in webview change", function(done){
        editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0,0), "x=3424523;")
        }).then(()=>{
            setTimeout(()=>{
                assert.equal(panel.webview.html.includes(`"x":3424523`), true, panel.webview.html)
                done()
            },4000)
        })
    });

    suiteTeardown(function(){
        previewManager.dispose()
    })

});