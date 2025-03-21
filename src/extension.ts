'use strict';
import * as vscode from "vscode";
import PreviewManager from "./PreviewManager"
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

    const closeArepl = vscode.commands.registerCommand("extension.closeAREPL", ()=>{
        previewManager.dispose()
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

    const printDir = vscode.commands.registerCommand("extension.printDir", () => {
        previewManager.printDir()
    });

    // push to subscriptions list so that they are disposed automatically
    context.subscriptions.push(...[
        arepl,
        newAreplSession,
        closeArepl,
        areplOnHighlightedCode,
        executeAREPL,
        executeAREPLBlock,
        printDir
    ]);
}