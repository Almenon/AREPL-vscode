import * as assert from "assert";
import * as vscode from "vscode";
import PythonInlinePreview from '../../src/pythonInlinePreview'
import {UserError} from 'arepl-backend'

/**
 * this suite tests both PreviewManager and pythonPanelPreview
 * by activating funcs in PreviewManager and looking at html rendered by pythonPanelPreview
 */
suite("PreviewManager and pythonPanelPreview Tests", () => {

    const arepl = vscode.extensions.getExtension("almenon.arepl")!;
    const p = new PythonInlinePreview(null, null)
    const mockUserError: UserError = {
		"cause": null,
		"context": null,
		"_str": "",
		"exc_traceback": {},
		"exc_type": {
            "py/type": ""
        },
		"stack": {
            "py/seq": []
        }
    }

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
        const error:UserError = {

        }
        p.updateErrorGutterIcons()
    });

    suiteTeardown(function(){
        previewManager.dispose()
    })

});