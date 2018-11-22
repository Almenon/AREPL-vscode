'use strict';
import * as vscode from "vscode";
import PreviewManager from "./PreviewManager"
import { registerAreplDump, unregisterAreplDump } from "./registerAreplDump";
import vscodeUtils from "./vscodeUtilities";

let previewManager: PreviewManager = null;

export function activate(context: vscode.ExtensionContext) {

    const settings = vscode.workspace.getConfiguration("AREPL");

    // Register the commands that are provided to the user
    const arepl = vscode.commands.registerCommand("extension.currentAREPLSession", () => {
        createPreviewDoc(context);
    });

    const newAreplSession = vscode.commands.registerCommand("extension.newAREPLSession", ()=>{
        vscodeUtils.newUnsavedPythonDoc(vscodeUtils.getHighlightedText())
            .then(createPreviewDoc.bind(this, context));
    });

    // exact same as above, just defining command so users are aware of the feature
    const areplOnHighlightedCode = vscode.commands.registerCommand("extension.newAREPLSessionOnHighlightedCode", ()=>{
        vscodeUtils.newUnsavedPythonDoc(vscodeUtils.getHighlightedText())
            .then(createPreviewDoc.bind(this, context));
    });

    const executeAREPL = vscode.commands.registerCommand("extension.executeAREPL", () => {
        previewManager.runArepl()
    });

    // push to subscriptions list so that they are disposed automatically
    context.subscriptions.push(...[arepl, newAreplSession, areplOnHighlightedCode, executeAREPL]);

    // registering arepldump last in case it errors out
    // (an error here will lead to the user not being to import arepldump)
    // (but we can live with that, arepldump is just a optional extra feature)
    registerAreplDump(settings.get<string>("pythonPath"), context.extensionPath)
}

export function createPreviewDoc(context: vscode.ExtensionContext) {
    previewManager = new PreviewManager(context);
    previewManager.startArepl()
}


// This method is called when extension is deactivated
export function deactivate() {
    const settings = vscode.workspace.getConfiguration("AREPL");
    unregisterAreplDump(settings.get("pythonPath"))
}