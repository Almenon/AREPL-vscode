'use strict'
import * as vscode from 'vscode'
import HtmlDocumentContentProvider from './HtmlDocumentContentProvider'
import {debounce} from './decorators'
import pyGuiLibraryIsPresent from './pyGuiLibraryIsPresent'
import {PythonEvaluator} from 'arepl-backend'

// This class initializes the previewmanager based on extension type and manages all the subscriptions
export default class PreviewManager {

    pythonPreviewContentProvider: HtmlDocumentContentProvider;
    disposable: vscode.Disposable;
    pythonEditor: vscode.TextDocument;
    pythonEvaluator: PythonEvaluator;
    restartedLastTime = false;

    constructor(context: vscode.ExtensionContext) {
        this.pythonPreviewContentProvider = new HtmlDocumentContentProvider(context);
        this.pythonEvaluator = new PythonEvaluator()
        this.pythonEditor = vscode.window.activeTextEditor.document;

        vscode.workspace.registerTextDocumentContentProvider(HtmlDocumentContentProvider.scheme, this.pythonPreviewContentProvider);

        /////////////////////////////////////////////////////////
        //		python
        /////////////////////////////////////////////////////////
        let self:PreviewManager = this;

        this.pythonEvaluator.startPython()
        this.pythonEvaluator.pyshell.childProcess.on('error', err => {
            let error:any = err; //typescript complains about type for some reason so defining to any
            this.pythonPreviewContentProvider.handleSpawnError(error.path, error.spawnargs[0], error.stack);
        })

        // binding this to the class so it doesn't get overwritten by PythonEvaluator
        this.pythonEvaluator.onPrint =  this.pythonPreviewContentProvider.handlePrint.bind(this.pythonPreviewContentProvider)
        this.pythonEvaluator.onResult = this.pythonPreviewContentProvider.handleResult.bind(this.pythonPreviewContentProvider)

        /////////////////////////////////////////////////////////
        // doc stuff
        /////////////////////////////////////////////////////////

        let subscriptions: vscode.Disposable[] = [];
        this.disposable = vscode.Disposable.from(...subscriptions);
        vscode.workspace.onDidChangeTextDocument(this.onUserInput, this, subscriptions);

        vscode.workspace.onDidCloseTextDocument((e)=>{
            if(e == this.pythonEditor || e.uri.scheme == HtmlDocumentContentProvider.scheme) this.dispose()
        })

        vscode.window.onDidChangeActiveTextEditor((e) => {
            if(e == null) return;
            // might be better way to do this - look at other editors
            // other extensions (like markdown preview enhanced) leave preview in place when switching
            // but preview contents change if you go to different md doc
            if(e.document == this.pythonEditor){
                console.log("back to active editor")
                //todo: reopen preview
            }
            else{
                console.log("left active editor")
                // todo: close preview
                // but make sure that doesnt trigger dispose event for python process!
            }
        })
    }

    dispose() {
        if(this.pythonEvaluator.pyshell != null && this.pythonEvaluator.pyshell.childProcess != null){
            this.pythonEvaluator.stop()
        }
        this.disposable.dispose();
    }

    @debounce(300)
    private onUserInput(event: vscode.TextDocumentChangeEvent) {
        if(event.document == this.pythonEditor){
            let text = event.document.getText();
            let codeLines = text.split('\n')
            let savedLines:string[] = []

            codeLines.forEach((line,i)=>{
                if(line.trim().endsWith('#$save')){
                    savedLines = codeLines.slice(0,i+1)
                    codeLines = codeLines.slice(i+1,codeLines.length)
                }
            });
        
            let data = {
                savedCode: savedLines.join('\n'),
                evalCode: codeLines.join('\n')
            }

            if(pyGuiLibraryIsPresent(text)){
                this.pythonEvaluator.checkSyntax(data.savedCode + data.evalCode)
                .then(()=>{
                    this.restartPython(data)
                    this.restartedLastTime = true
                })
                .catch((error)=>{
                    this.pythonPreviewContentProvider.handleResult({'userVariables':{},'ERROR':error, execTime: 0, totalPyTime: 0, totalTime: 0})
                })
            }
            else if(this.restartedLastTime){ //if GUI code is gone need one last restart to get rid of GUI
                this.restartPython(data)
                this.restartedLastTime = false;
            }
            else{                
                this.pythonEvaluator.execCode(data)
            }

        }
    }

    public restartPython(data){
        this.pythonPreviewContentProvider.printResults = []
        this.pythonPreviewContentProvider.updateError("", true)
        this.pythonEvaluator.restart(
            this.pythonEvaluator.execCode.bind(this.pythonEvaluator, data)
        );     
    }
}