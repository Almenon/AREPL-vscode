import * as assert from "assert";
import * as vscode from "vscode";
import PreviewManager from "../src/PreviewManager"
import Utilities from "../src/utilities";


/**
 * this suite tests both PreviewManager and pythonPreview
 * by activating funcs in PreviewManager and looking at html rendered by pythonPreview
 */
suite("PreviewManager and pythonPreview Tests", () => {

    const arepl = vscode.extensions.getExtension("almenon.arepl")!;
    let editor:vscode.TextEditor

    const mockContext: any = {
        asAbsolutePath: (file: string)=>{
            return __dirname + "/" + file
        },
        extensionPath: arepl.extensionPath,
    }

    suiteSetup(function(done){
        Utilities.newUnsavedPythonDoc("").then((newEditor)=>{
            editor = newEditor;
            const previewManager = new PreviewManager(mockContext);
            previewManager.startArepl().then(()=>done()).catch((err)=>done(err))
        })
    })

    test("webview should be displayed", function(){
        console.log(vscode.workspace.textDocuments);
    });

    test("edits should result in webview change", function(){
        editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0,0), "x=1")
        }).then(()=>{
            console.log(vscode.workspace.textDocuments)
            // get webview
        })
    });

});