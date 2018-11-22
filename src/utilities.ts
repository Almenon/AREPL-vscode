"use strict"
import * as vscode from "vscode";

export default class Utilities {
    static isEmpty(obj: {}) {
        return Object.keys(obj).length === 0;
    }
      
    /**
     * see https://stackoverflow.com/a/12034334/6629672
     * @param string
     */
    static escapeHtml(input: string) {
        if (input == null) return null;
        return input.replace(/[&<>"'`=\/]/g, function(s) {
            return Utilities.entityMap[s];
        });
    }

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

    
    private static entityMap = {
        '"': "&quot;",
        "&": "&amp;",
        "'": "&#39;",
        "/": "&#x2F;",
        "<": "&lt;",
        "=": "&#x3D;",
        ">": "&gt;",
        "`": "&#x60;",
    };
}
