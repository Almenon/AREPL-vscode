'use strict';
import * as vscode from 'vscode';
import Utilities from './Utilities';
import PreviewManager from './PreviewManager'
import pythonPreviewContentProvider from './htmlDocumentContentProvider';

export function activate(context: vscode.ExtensionContext) {
    // Register the commands that are provided to the user
    let disposableSidePreview = vscode.commands.registerCommand('extension.evalPythonInRealTime', () => {
        createPreviewDoc(context, vscode.ViewColumn.Two); //show on right
    });
    // push to subscriptions list so that they are disposed automatically
    context.subscriptions.push(disposableSidePreview);
}

export function createPreviewDoc(context: vscode.ExtensionContext, viewColumn: vscode.ViewColumn) {
    let previewManager = new PreviewManager(context);
    return vscode.commands.executeCommand('vscode.previewHtml', pythonPreviewContentProvider.PREVIEW_URI, viewColumn);
    // https://code.visualstudio.com/docs/extensionAPI/vscode-api-commands
}


// This method is called when extension is deactivated
export function deactivate() {}