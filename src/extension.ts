'use strict';
import * as vscode from "vscode";
import PreviewManager from "./PreviewManager"
import pythonPreviewContentProvider from "./pythonPreview";
import { registerAreplDump, unregisterAreplDump } from "./registerAreplDump";
import Utilities from "./utilities";

export function activate(context: vscode.ExtensionContext) {

    const settings = vscode.workspace.getConfiguration("AREPL");
    registerAreplDump(settings.get<string>("pythonPath"), context.extensionPath)

    // Register the commands that are provided to the user
    const arepl = vscode.commands.registerCommand("extension.evalPythonInRealTime", () => {
        createPreviewDoc(context);
    });

    const newAreplSession = vscode.commands.registerCommand("extension.newAREPLSession", ()=>{
        Utilities.newUnsavedPythonDoc(Utilities.getHighlightedText())
            .then(createPreviewDoc.bind(this, context));
    });

    // exact same as above, just defining command so users are aware of the feature
    const areplOnHighlightedCode = vscode.commands.registerCommand("extension.newAREPLSessionOnHighlightedCode", ()=>{
        Utilities.newUnsavedPythonDoc(Utilities.getHighlightedText())
            .then(createPreviewDoc.bind(this, context));
    });

    // push to subscriptions list so that they are disposed automatically
    context.subscriptions.push(arepl);
    context.subscriptions.push(newAreplSession);
}

export function createPreviewDoc(context: vscode.ExtensionContext) {

    const previewManager = new PreviewManager(context);
    previewManager.startArepl()
    
    // viewcolum 2 to show on right
    return vscode.commands.executeCommand(
        "vscode.previewHtml", 
        pythonPreviewContentProvider.PREVIEW_URI, vscode.ViewColumn.Two);
    // https://code.visualstudio.com/docs/extensionAPI/vscode-api-commands
}


// This method is called when extension is deactivated
export function deactivate() {
    const settings = vscode.workspace.getConfiguration("AREPL");
    unregisterAreplDump(settings.get("pythonPath"))
}