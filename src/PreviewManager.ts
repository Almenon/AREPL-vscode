'use strict'
import * as vscode from 'vscode'
import HtmlDocumentContentProvider from './HTMLDocumentContentProvider'
import {PythonEvaluator} from 'arepl-backend'
import Reporter from './telemetry'
import {EOL} from 'os'
import {pythonInterface} from './pythonInterface'

// This class initializes the previewmanager based on extension type and manages all the subscriptions
export default class PreviewManager {

    reporter: Reporter;
    pythonPreviewContentProvider: HtmlDocumentContentProvider;
    disposable: vscode.Disposable;
    pythonEditor: vscode.TextDocument;
    pythonEvaluator: PythonEvaluator;
    status: vscode.StatusBarItem;
    settings:vscode.WorkspaceConfiguration;
    pythonInterface:pythonInterface

    constructor(context: vscode.ExtensionContext) {
        this.settings = vscode.workspace.getConfiguration('AREPL');
        this.pythonPreviewContentProvider = new HtmlDocumentContentProvider(context);
        this.pythonEditor = vscode.window.activeTextEditor.document;
        this.reporter = new Reporter(this.settings.get<boolean>('telemetry'))
        this.status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.status.text = "Running python..."
        this.status.tooltip = "AREPL is currently running your python file.  Close the AREPL preview to stop"

        vscode.workspace.registerTextDocumentContentProvider(HtmlDocumentContentProvider.scheme, this.pythonPreviewContentProvider);
    }

    async startArepl(){
        this.startAndBindPython()

        if(this.pythonEditor.isUntitled && this.pythonEditor.getText() == ""){
            await this.insertDefaultImports(vscode.window.activeTextEditor)
            // waiting for this to complete so i dont accidentily trigger
            // the edit doc handler when i insert imports
        }

        this.subscribeHandlersToDoc()
    }

    /**
     * starts AREPL python backend and binds print&result output to the handlers
     */
    private startAndBindPython(){
        let pythonPath = this.settings.get<string>('pythonPath')
        let pythonOptions = this.settings.get<string[]>('pythonOptions')

        this.pythonEvaluator = new PythonEvaluator(pythonPath, pythonOptions)
        
        this.pythonEvaluator.startPython()
        this.pythonEvaluator.pyshell.childProcess.on('error', err => {
            let error:any = err; //typescript complains about type for some reason so defining to any
            this.pythonPreviewContentProvider.handleSpawnError(error.path, error.spawnargs[0], error.stack);
            this.reporter.sendError("error starting python: " + error.path)
        })

        this.pythonInterface = new pythonInterface(this.pythonEvaluator, this.pythonPreviewContentProvider, this.reporter)

        // binding this to the class so it doesn't get overwritten by PythonEvaluator
        this.pythonEvaluator.onPrint =  this.pythonPreviewContentProvider.handlePrint.bind(this.pythonPreviewContentProvider)
        this.pythonEvaluator.onResult = result => {
            this.status.hide()
            this.pythonInterface.handleResult(result)
        }
    }

    /**
     * binds various funcs to activate upon edit of document / switching of active doc / etc...
     */
    private subscribeHandlersToDoc(){

        let debounce = this.settings.get<number>('delay');
        let restartExtraDebounce = this.settings.get<number>('restartDelay');

        if(this.settings.get<boolean>("skipLandingPage")){
            this.onAnyDocChange(this.pythonEditor);
        }

        let subscriptions: vscode.Disposable[] = [];

        if(this.settings.get<string>('whenToExecute').toLowerCase() == "onsave"){
            vscode.workspace.onDidSaveTextDocument((e)=>{
                this.onAnyDocChange(e)
            }, this, subscriptions)
        }
        else{
            vscode.workspace.onDidChangeTextDocument((e)=>{
                let delay = this.pythonInterface.restartMode ? debounce + restartExtraDebounce : debounce
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

    private insertDefaultImports(editor: vscode.TextEditor){
        return editor.edit((editBuilder)=>{
            let imports = this.settings.get<string[]>("defaultImports")

            imports = imports.filter(i => i.trim() != "")
            if(imports.length == 0) return

            imports = imports.map(i => {
                let words = i.split(' ')

                // python import syntax: "import library" or "from library import method"
                // so if user didnt specify import we will do that for them :)
                if(words[0] != "import" && words[0] != "from" && words[0].length > 0){
                    i = "import " + i
                }

                return i
            })

            editBuilder.insert(new vscode.Position(0,0), imports.join(EOL) + EOL)
        })
    }

    dispose() {
        if(this.pythonEvaluator.pyshell != null && this.pythonEvaluator.pyshell.childProcess != null){
            this.pythonEvaluator.stop()
        }
        this.disposable.dispose();
        this.status.dispose();
        this.reporter.sendFinishedEvent(this.settings)
        this.reporter.dispose();
    }

    private onAnyDocChange(event: vscode.TextDocument){
        if(event == this.pythonEditor){

            this.status.show();

            let text = event.getText()
            let filePath = this.pythonEditor.isUntitled ? "" : this.pythonEditor.fileName
            this.pythonInterface.onUserInput(text, filePath)
        }        
    }
}