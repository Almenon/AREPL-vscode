"use strict"
import {PythonEvaluator} from "arepl-backend"
import {EOL} from "os"
import { isAbsolute, sep } from "path";
import * as vscode from "vscode"
import { PreviewContainer } from "./previewContainer";
import Reporter from "./telemetry"
import {ToAREPLLogic} from "./toAREPLLogic"
import vscodeUtils from "./vscodeUtilities";

/**
 * class with logic for starting arepl and arepl preview
 */
export default class PreviewManager {

    reporter: Reporter;
    disposable: vscode.Disposable;
    pythonEditor: vscode.TextDocument;
    pythonEvaluator: PythonEvaluator;
    status: vscode.StatusBarItem;
    settings: vscode.WorkspaceConfiguration;
    toAREPLLogic: ToAREPLLogic
    previewContainer: PreviewContainer
    subscriptions: vscode.Disposable[] = [];

    /**
     * assumes a text editor is already open - if not will error out
     */
    constructor(context: vscode.ExtensionContext) {
        this.settings = vscode.workspace.getConfiguration("AREPL");
        this.pythonEditor = vscode.window.activeTextEditor.document;
        this.reporter = new Reporter(this.settings.get<boolean>("telemetry"))
        this.status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.status.text = "Running python..."
        this.status.tooltip = "AREPL is currently running your python file.  Close the AREPL preview to stop"

        this.previewContainer = new PreviewContainer(this.reporter, context, this.settings)
    }

    async startArepl(){
        let panel = this.previewContainer.start();
        this.subscriptions.push(panel)
        panel.onDidDispose(()=>this.dispose(), this, this.subscriptions)

        this.startAndBindPython()

        if(this.pythonEditor.isUntitled && this.pythonEditor.getText() == "") {
            await this.insertDefaultImports(vscode.window.activeTextEditor)
            // waiting for this to complete so i dont accidentily trigger
            // the edit doc handler when i insert imports
        }

        this.subscribeHandlersToDoc()

        return panel
    }

    runArepl(){
        this.onAnyDocChange(vscode.window.activeTextEditor.document)
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

        if(vscode.window.activeTextEditor){
            vscode.window.activeTextEditor.setDecorations(this.previewContainer.errorDecorationType, [])
        }
    }

    /**
     * starts AREPL python backend and binds print&result output to the handlers
     */
    private startAndBindPython(){
        let pythonPath = this.settings.get<string>("pythonPath")
        const pythonOptions = this.settings.get<string[]>("pythonOptions")

        if(pythonPath){
            pythonPath = pythonPath.replace("${workspaceFolder}", vscodeUtils.getCurrentWorkspaceFolder())

            // if its a relative path, make it absolute
            if(pythonPath.includes(sep) && !isAbsolute(pythonPath)){
                pythonPath = vscodeUtils.getCurrentWorkspaceFolder() + sep + pythonPath
            }
        }

        this.pythonEvaluator = new PythonEvaluator(pythonPath, pythonOptions)
        
        this.pythonEvaluator.startPython()
        this.pythonEvaluator.pyshell.childProcess.on("error", err => {
            /* The 'error' event is emitted whenever:
            The process could not be spawned, or
            The process could not be killed, or
            Sending a message to the child process failed.
            */

            // @ts-ignore err is maltyped for some reason, not sure what correct type is
            const error = `Error running python with command: ${err.path} ${err.spawnargs.join(' ')}\n${err.stack}`
            this.previewContainer.displayProcessError(error);
            this.reporter.sendError(error)
        })

        this.toAREPLLogic = new ToAREPLLogic(this.pythonEvaluator, this.previewContainer)

        // binding this to the class so it doesn't get overwritten by PythonEvaluator
        this.pythonEvaluator.onPrint = this.previewContainer.handlePrint.bind(this.previewContainer)
        // this is bad - stderr should be handled seperately so user is aware its different
        // but better than not showing stderr at all, so for now printing it out and ill fix later
        this.pythonEvaluator.onStderr = this.previewContainer.handlePrint.bind(this.previewContainer)
        this.pythonEvaluator.onResult = result => {
            this.status.hide()
            this.previewContainer.handleResult(result)
        }
    }

    /**
     * binds various funcs to activate upon edit of document / switching of active doc / etc...
     */
    private subscribeHandlersToDoc(){

        const debounce = this.settings.get<number>("delay");
        const restartExtraDebounce = this.settings.get<number>("restartDelay");

        if(this.settings.get<boolean>("skipLandingPage")){
            this.onAnyDocChange(this.pythonEditor);
        }

        if(this.settings.get<string>("whenToExecute") == "onSave"){
            vscode.workspace.onDidSaveTextDocument((e) => {
                this.onAnyDocChange(e)
            }, this, this.subscriptions)
        }
        else if(this.settings.get<string>("whenToExecute") == "afterDelay"){
            vscode.workspace.onDidChangeTextDocument((e) => {
                const delay = this.toAREPLLogic.restartMode ? debounce + restartExtraDebounce : debounce
                this.pythonEvaluator.debounce(this.onAnyDocChange.bind(this, e.document), delay)
            }, this, this.subscriptions)
        }
        else {} //third option is onKeybinding in which case user manually invokes arepl
        
        vscode.workspace.onDidCloseTextDocument((e) => {
            if(e == this.pythonEditor) this.dispose()
        }, this, this.subscriptions)
    }

    private insertDefaultImports(editor: vscode.TextEditor){
        return editor.edit((editBuilder) => {
            let imports = this.settings.get<string[]>("defaultImports")

            imports = imports.filter(i => i.trim() != "")
            if(imports.length == 0) return

            imports = imports.map(i => {
                const words = i.split(" ")

                // python import syntax: "import library" or "from library import method"
                // so if user didnt specify import we will do that for them :)
                if(words[0] != "import" && words[0] != "from" && words[0].length > 0){
                    i = "import " + i
                }

                return i
            })

            editBuilder.insert(new vscode.Position(0, 0), imports.join(EOL) + EOL)
        })
    }

    private onAnyDocChange(event: vscode.TextDocument){
        if(event == this.pythonEditor){

            this.status.show();

            const text = event.getText()
            const filePath = this.pythonEditor.isUntitled ? "" : this.pythonEditor.fileName
            this.toAREPLLogic.onUserInput(text, filePath)
        }        
    }
}
