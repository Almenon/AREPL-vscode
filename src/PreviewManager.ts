'use strict'
import {PythonEvaluator} from "arepl-backend"
import {EOL} from "os"
import { previewContainer } from "./previewContainer";
import Reporter from "./telemetry"
import {toAREPLLogic} from "./toAREPLLogic"
import * as vscode from "vscode"

// This class initializes the previewmanager based on extension type and manages all the subscriptions
export default class PreviewManager {

    reporter: Reporter;
    disposable: vscode.Disposable;
    pythonEditor: vscode.TextDocument;
    pythonEvaluator: PythonEvaluator;
    status: vscode.StatusBarItem;
    settings:vscode.WorkspaceConfiguration;
    toAREPLLogic:toAREPLLogic
    previewContainer:previewContainer
    subscriptions: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.settings = vscode.workspace.getConfiguration('AREPL');
        this.pythonEditor = vscode.window.activeTextEditor.document;
        this.reporter = new Reporter(this.settings.get<boolean>('telemetry'))
        this.status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.status.text = "Running python..."
        this.status.tooltip = "AREPL is currently running your python file.  Close the AREPL preview to stop"

        this.previewContainer = new previewContainer(this.reporter, context)
    }

    async startArepl(){
        this.subscriptions.push(this.previewContainer.register())

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
            this.previewContainer.handleSpawnError(error.path, error.spawnargs[0], error.stack);
            this.reporter.sendError("error starting python: " + error.path)
        })

        this.toAREPLLogic = new toAREPLLogic(this.pythonEvaluator, this.previewContainer)

        // binding this to the class so it doesn't get overwritten by PythonEvaluator
        this.pythonEvaluator.onPrint = this.previewContainer.handlePrint.bind(this.previewContainer)
        this.pythonEvaluator.onResult = result => {
            this.status.hide()
            //@ts-ignore todo: fix typing in backend
            this.previewContainer.handleResult(result)
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

        if(this.settings.get<string>('whenToExecute').toLowerCase() == "onsave"){
            vscode.workspace.onDidSaveTextDocument((e)=>{
                this.onAnyDocChange(e)
            }, this, this.subscriptions)
        }
        else{
            vscode.workspace.onDidChangeTextDocument((e)=>{
                let delay = this.toAREPLLogic.restartMode ? debounce + restartExtraDebounce : debounce
                this.pythonEvaluator.debounce(this.onAnyDocChange.bind(this,e.document), delay)
            }, this, this.subscriptions)
        }
        
        vscode.workspace.onDidCloseTextDocument((e)=>{
            if(e == this.pythonEditor || e.uri.scheme == this.previewContainer.scheme) this.dispose()
        }, this, this.subscriptions)
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

        this.disposable = vscode.Disposable.from(...this.subscriptions);
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
            this.toAREPLLogic.onUserInput(text, filePath)
        }        
    }
}