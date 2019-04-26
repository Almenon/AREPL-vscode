'use strict';
import * as vscode from "vscode";
import PreviewManager from "./PreviewManager"
import { registerAreplDump, unregisterAreplDump } from "./registerAreplDump";
import vscodeUtils from "./vscodeUtilities";

let previewManager: PreviewManager = null;

export function activate(context: vscode.ExtensionContext) {

    previewManager = new PreviewManager(context);

    // Register the commands that are provided to the user
    const arepl = vscode.commands.registerCommand("extension.currentAREPLSession", () => {
        previewManager.startArepl();
    });

    const newAreplSession = vscode.commands.registerCommand("extension.newAREPLSession", ()=>{
        vscodeUtils.newUnsavedPythonDoc(vscodeUtils.getHighlightedText())
            .then(()=>{previewManager.startArepl()});
    });

    // exact same as above, just defining command so users are aware of the feature
    const areplOnHighlightedCode = vscode.commands.registerCommand("extension.newAREPLSessionOnHighlightedCode", ()=>{
        vscodeUtils.newUnsavedPythonDoc(vscodeUtils.getHighlightedText())
            .then(()=>{previewManager.startArepl()});
    });

    const executeAREPL = vscode.commands.registerCommand("extension.executeAREPL", () => {
        previewManager.runArepl()
    });

    const executeAREPLBlock = vscode.commands.registerCommand("extension.executeAREPLBlock", () => {
        previewManager.runAreplBlock()
    });

    // push to subscriptions list so that they are disposed automatically
    context.subscriptions.push(...[arepl, newAreplSession, areplOnHighlightedCode, executeAREPL, executeAREPLBlock]);

    // registering arepldump last in case it errors out
    // (an error here will lead to the user not being to import arepldump)
    // (but we can live with that, arepldump is just a optional extra feature)
    registerAreplDump(previewManager.getPythonPath(), context.extensionPath)
}


// This method is called when extension is deactivated
export function deactivate() {
    unregisterAreplDump(previewManager.getPythonPath())
}