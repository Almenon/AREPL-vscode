'use strict'
import * as vscode from 'vscode'
import HtmlDocumentContentProvider from './HTMLDocumentContentProvider'
import pyGuiLibraryIsPresent from './pyGuiLibraryIsPresent'
import {PythonEvaluator} from 'arepl-backend'
import {buffer} from './buffer'

// This class initializes the previewmanager based on extension type and manages all the subscriptions
export default class PreviewManager {

    restartMode: boolean;
    pythonPreviewContentProvider: HtmlDocumentContentProvider;
    disposable: vscode.Disposable;
    pythonEditor: vscode.TextDocument;
    pythonEvaluator: PythonEvaluator;
    restartedLastTime = false;
    status: vscode.StatusBarItem;
    bufferedPrint:buffer

    constructor(context: vscode.ExtensionContext) {

        const settings = vscode.workspace.getConfiguration('AREPL');

        this.pythonPreviewContentProvider = new HtmlDocumentContentProvider(context);
        this.pythonEditor = vscode.window.activeTextEditor.document;
        this.status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.status.text = "Running python..."
        this.status.tooltip = "AREPL is currently running your python file.  Close the AREPL preview to stop"
        
        
        vscode.workspace.registerTextDocumentContentProvider(HtmlDocumentContentProvider.scheme, this.pythonPreviewContentProvider);
        
        /////////////////////////////////////////////////////////
        //		python
        /////////////////////////////////////////////////////////
        this.bufferedPrint = new buffer(this.pythonPreviewContentProvider.handlePrint, this.pythonPreviewContentProvider, 50, '\n')

        let pythonPath = settings.get<string>('pythonPath')
        let pythonOptions = settings.get<string[]>('pythonOptions')

        this.pythonEvaluator = new PythonEvaluator(pythonPath, pythonOptions)

        let debounce = settings.get<number>('delay');
        let restartExtraDebounce = settings.get<number>('restartDelay');
        
        this.pythonEvaluator.startPython()
        this.pythonEvaluator.pyshell.childProcess.on('error', err => {
            let error:any = err; //typescript complains about type for some reason so defining to any
            this.pythonPreviewContentProvider.handleSpawnError(error.path, error.spawnargs[0], error.stack);
        })

        // binding this to the class so it doesn't get overwritten by PythonEvaluator
        this.pythonEvaluator.onPrint =  this.bufferedPrint.call.bind(this.bufferedPrint)
        this.pythonEvaluator.onResult = this.handleResult.bind(this)

        /////////////////////////////////////////////////////////
        // doc stuff
        /////////////////////////////////////////////////////////

        if(settings.get<boolean>("skipLandingPage")){
            this.onUserInput(this.pythonEditor.getText())
        }

        let subscriptions: vscode.Disposable[] = [];

        if(settings.get<string>('whenToExecute').toLowerCase() == "onsave"){
            vscode.workspace.onDidSaveTextDocument((e)=>{
                this.onAnyDocChange(e)
            }, this, subscriptions)
        }
        else{
            vscode.workspace.onDidChangeTextDocument((e)=>{
                let delay = this.restartMode ? debounce + restartExtraDebounce : debounce
                this.pythonEvaluator.debounce(this.onAnyDocChange.bind(this,e.document), delay)
            }, this, subscriptions)
        }
        
        vscode.workspace.onDidCloseTextDocument((e)=>{
            if(e == this.pythonEditor || e.uri.scheme == HtmlDocumentContentProvider.scheme) this.dispose()
        }, this, subscriptions)
        
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
        }, this, subscriptions)
        
        this.disposable = vscode.Disposable.from(...subscriptions);
    }

    dispose() {
        if(this.pythonEvaluator.pyshell != null && this.pythonEvaluator.pyshell.childProcess != null){
            this.pythonEvaluator.stop()
        }
        this.disposable.dispose();
        this.status.dispose();
    }

    private onAnyDocChange(event: vscode.TextDocument){
        if(event == this.pythonEditor){
            let text = event.getText()
            this.onUserInput(text)
        }        
    }

    private onUserInput(text: string) {
            let codeLines = text.split('\n')
            let savedLines:string[] = []

            this.status.show();

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

            this.restartMode = pyGuiLibraryIsPresent(text)
            
            if(this.restartMode){
                let syntaxPromise: Promise<{}>

                // #22 it might be faster to use checkSyntaxFile but this is simpler
                syntaxPromise = this.pythonEvaluator.checkSyntax(data.savedCode + data.evalCode)

                syntaxPromise.then(()=>{
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

    private handleResult(pythonResults: {ERROR:string, userVariables:Object, execTime:number, totalPyTime:number, totalTime:number}){
        this.status.text = "rendering results"
        this.bufferedPrint.flushBuffer(false) //no need to refresh when we will handle result soon
        this.pythonPreviewContentProvider.handleResult(pythonResults)
        this.status.hide()
    }

    private restartPython(data){
        this.pythonPreviewContentProvider.printResults = []
        this.pythonPreviewContentProvider.updateError("", true)
        this.pythonEvaluator.restart(
            this.pythonEvaluator.execCode.bind(this.pythonEvaluator, data)
        );     
    }
}