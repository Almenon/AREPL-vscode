'use strict';
import * as vscode from "vscode";
import Arepl from "./arepl"
import { registerAreplDump, unregisterAreplDump } from "./registerAreplDump";
import vscodeUtils from "./vscodeUtilities";
import areplUtils from "./areplUtilities";

let previewManager: Arepl = null;

export function activate(context: vscode.ExtensionContext) {

    previewManager = new Arepl(context);

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

    // registering arepldump last in case it errors out
    // (an error here will lead to the user not being to import arepldump)
    // (but we can live with that, arepldump is just a optional extra feature)
    registerAreplDump(areplUtils.getPythonPath(), context.extensionPath)
}


// This method is called when extension is deactivated
export function deactivate() {
    unregisterAreplDump(areplUtils.getPythonPath())
}