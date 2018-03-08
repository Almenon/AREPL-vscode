'use strict';
import * as vscode from 'vscode';
import Utilities from './utilities';
import PreviewManager from './PreviewManager'
import pythonPreviewContentProvider from './HTMLDocumentContentProvider';

export function activate(context: vscode.ExtensionContext) {
    // Register the commands that are provided to the user
    let disposableSidePreview = vscode.commands.registerCommand('extension.evalPythonInRealTime', () => {
        createPreviewDoc(context);
    });

    let newAREPLSession = vscode.commands.registerCommand('extension.newAREPLSession', async () => {
        const cssDocument = await vscode.workspace.openTextDocument({
            content: '',
            language: 'python'
        });
    
        vscode.window.showTextDocument(cssDocument).then(createPreviewDoc.bind(this, context));
    });

    // push to subscriptions list so that they are disposed automatically
    context.subscriptions.push(disposableSidePreview);
    context.subscriptions.push(newAREPLSession);
}

export function createPreviewDoc(context: vscode.ExtensionContext) {
    let previewManager = new PreviewManager(context);
    return vscode.commands.executeCommand('vscode.previewHtml', pythonPreviewContentProvider.PREVIEW_URI, vscode.ViewColumn.Two); //show on right
    // https://code.visualstudio.com/docs/extensionAPI/vscode-api-commands
}


// This method is called when extension is deactivated
export function deactivate() {}