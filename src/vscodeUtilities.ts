"use strict"
import * as vscode from "vscode";
import { isAbsolute, sep } from "path";

export default class vscodeUtils {

    /**
     * expands ${} macros like ${workspaceFolder} or ${env:foo}
     */
    static expandSettingMacros(setting: string){
        setting = setting.replace("${workspaceFolder}", vscodeUtils.getCurrentWorkspaceFolder())

        const envVar = setting.match(/\${env:([^}]+)}/)
        if(envVar){
            setting = setting.replace("${env:"+envVar[1]+"}", process.env[envVar[1]])
        }
        
        return setting
    }

    /**
     * returns absolute path with macros expanded
     */
    static expandPathSetting(path: string){
        path = this.expandSettingMacros(path)

        // if its a relative path, make it absolute
        if(path.includes(sep) && !isAbsolute(path)){
            path = vscodeUtils.getCurrentWorkspaceFolder() + sep + path
        }

        return path
    }

    /**
     * returns doc eol as string;
     * necessary because vscode stores it as a number for some stupid reason
     */
    static eol(doc: vscode.TextDocument){
        return doc.eol == 1 ? "\n":"\r\n"
    }

    static async newUnsavedPythonDoc(content = ""){
        const pyDoc = await vscode.workspace.openTextDocument({
            content,
            language: "python",
        });
    
        return vscode.window.showTextDocument(pyDoc);
    }

    /**
     * returns block of text at lineNum, where a block is defined as a series of adjacent non-empty lines
     */
    static getBlockOfText(editor: vscode.TextEditor, lineNum: number){
        let block = editor.document.lineAt(lineNum).range

        while(block.start.line > 0){
            const aboveLine = editor.document.lineAt(block.start.line-1)
            if(aboveLine.isEmptyOrWhitespace) break;
            else block = new vscode.Range(aboveLine.range.start, block.end)
        }

        while(block.end.line < editor.document.lineCount-1){
            const belowLine = editor.document.lineAt(block.end.line+1)
            if(belowLine.isEmptyOrWhitespace) break;
            else block = new vscode.Range(block.start, belowLine.range.end)
        }

        return block
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
     * returns current workspace folder uri or undefined if no folder open
     */
    static getCurrentWorkspaceFolderUri(): vscode.Uri{
        const workspaceFolders = vscode.workspace.workspaceFolders
        if(workspaceFolders && workspaceFolders.length > 0 && workspaceFolders[0]){
            return workspaceFolders[0].uri
        }
        
    }

    /**
     * returns current folder path. 
     * If no folder is open either returns friendly warning or empty string
     */
    static getCurrentWorkspaceFolder(friendlyWarning=true): string{
        const path = this.getCurrentWorkspaceFolderUri()
        if(path) return path.fsPath;
        else return friendlyWarning ? "could not find workspace folder" : ""
    }

    /**
     * gets setting or if undefined/empty a setting from different extension.
     * Assumes setting from other extension has the same name and type.
     */
    static getSettingOrOtherExtSettingAsDefault<T>(primaryExt: string, otherExt: string, setting: string): T{
        let primarySetting = vscode.workspace.getConfiguration(primaryExt).get<T>(setting)

        const otherExtensionSettings = vscode.workspace.getConfiguration(otherExt, this.getCurrentWorkspaceFolderUri())
        const otherSetting = otherExtensionSettings.get<T>(setting)
        if(otherSetting && !primarySetting) primarySetting = otherSetting       
        return primarySetting
    }
}