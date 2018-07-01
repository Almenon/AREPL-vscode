'use strict';
import * as vscode from 'vscode';
import Utilities from './utilities';
import PreviewManager from './PreviewManager'
import pythonPreviewContentProvider from './pythonPreview';
import { registerAreplDump, unregisterAreplDump } from './registerAreplDump';

export function activate(context: vscode.ExtensionContext) {

    let settings = vscode.workspace.getConfiguration('AREPL');
    registerAreplDump(settings.get<string>('pythonPath'), context.extensionPath)

    // Register the commands that are provided to the user
    let arepl = vscode.commands.registerCommand('extension.evalPythonInRealTime', () => {
        createPreviewDoc(context);
    });

    let newAreplSession = vscode.commands.registerCommand('extension.newAREPLSession', ()=>{
        Utilities.newUnsavedPythonDoc(Utilities.getHighlightedText())
            .then(createPreviewDoc.bind(this, context));
    });

    // exact same as above, just defining command so users are aware of the feature
    let areplOnHighlightedCode = vscode.commands.registerCommand('extension.newAREPLSessionOnHighlightedCode', ()=>{
        Utilities.newUnsavedPythonDoc(Utilities.getHighlightedText())
            .then(createPreviewDoc.bind(this, context));
    });

    // push to subscriptions list so that they are disposed automatically
    context.subscriptions.push(arepl);
    context.subscriptions.push(newAreplSession);
}

export function createPreviewDoc(context: vscode.ExtensionContext) {

    let previewManager = new PreviewManager(context);
    previewManager.startArepl()
    
    return vscode.commands.executeCommand('vscode.previewHtml', pythonPreviewContentProvider.PREVIEW_URI, vscode.ViewColumn.Two); //show on right
    // https://code.visualstudio.com/docs/extensionAPI/vscode-api-commands
}


// This method is called when extension is deactivated
export function deactivate() {
    let settings = vscode.workspace.getConfiguration('AREPL');
    unregisterAreplDump(settings.get('pythonPath'))
}