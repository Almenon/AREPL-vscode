"use strict"
import * as vscode from "vscode";

export default class vscodeUtils {
    static async newUnsavedPythonDoc(content = ""){
        const pyDoc = await vscode.workspace.openTextDocument({
            content,
            language: "python",
        });
    
        return await vscode.window.showTextDocument(pyDoc);
    }
    
    /**
     * gets first highlighted text of active doc
     * if no highlight or no active editor returns empty string
     */
    static getHighlightedText(){
        const editor = vscode.window.activeTextEditor;
        if(!editor) return ""
        return editor.document.getText(editor.selection)
    }
    
    /**
     * returns current folder path or a string "could not find workspace folder" if no folder is open
     */
    static getCurrentWorkspaceFolder(){
        if(vscode.workspace.workspaceFolders){
            return vscode.workspace.workspaceFolders[0].uri.fsPath
        }
        else return "could not find workspace folder"
    }
}