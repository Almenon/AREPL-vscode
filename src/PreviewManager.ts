"use strict"
import {PythonEvaluator, ExecArgs} from "arepl-backend"
import areplUtils from "./areplUtilities"
import * as vscode from "vscode"
import { EnvironmentVariablesProvider } from "./env/variables/environmentVariablesProvider"
import { EnvironmentVariablesService } from "./env/variables/environment"
import { join, basename } from "path";
import { PreviewContainer } from "./previewContainer"
import Reporter from "./telemetry"
import {ToAREPLLogic} from "./toAREPLLogic"
import { PythonShell } from "python-shell"
import {settings} from "./settings"
import printDir from "./printDir";
import { PlatformService } from "./env/platform/platformService"
import { PathUtils } from "./env/platform/pathUtils"
import vscodeUtils from "./vscodeUtilities"
import { WorkspaceService } from "./env/application/workspace"

/**
 * class with logic for starting arepl and arepl preview
 */
export default class PreviewManager {

    reporter: Reporter;
    disposable: vscode.Disposable;
    pythonEditorDoc: vscode.TextDocument;
    PythonEvaluator: PythonEvaluator;
    runningStatus: vscode.StatusBarItem;
    toAREPLLogic: ToAREPLLogic
    previewContainer: PreviewContainer
    subscriptions: vscode.Disposable[] = []
    highlightDecorationType: vscode.TextEditorDecorationType
    pythonEditor: vscode.TextEditor;

    /**
     * assumes a text editor is already open - if not will error out
     */
    constructor(context: vscode.ExtensionContext) {
        this.startDisposables()
        this.previewContainer = new PreviewContainer(this.reporter, context)
    }

    startDisposables(){
        this.runningStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.runningStatus.text = "Running python..."
        this.runningStatus.tooltip = "AREPL is currently running your python file.  Close the AREPL preview to stop"
        this.reporter = new Reporter(settings().get<boolean>("telemetry"))

        this.highlightDecorationType = vscode.window.createTextEditorDecorationType(<vscode.ThemableDecorationRenderOptions>{
            backgroundColor: 'yellow'
        })
    }

    async loadAndWatchEnvVars(){
        const platformService = new PlatformService()
        const envVarsService = new EnvironmentVariablesService(new PathUtils(platformService.isWindows))
        const workspaceService = new WorkspaceService()
        const e = new EnvironmentVariablesProvider(envVarsService,
            this.subscriptions,
            platformService,
            workspaceService,
            process)
        return e.getEnvironmentVariables(areplUtils.getEnvFilePath(), vscodeUtils.getCurrentWorkspaceFolderUri())
    }

    startArepl(){
        // see https://github.com/Microsoft/vscode/issues/46445
        vscode.commands.executeCommand("setContext", "arepl", true)

        this.startDisposables()

        if(!vscode.window.activeTextEditor){
            vscode.window.showErrorMessage("no active text editor open")
            return
        }
        this.pythonEditor = vscode.window.activeTextEditor
        this.pythonEditorDoc = this.pythonEditor.document

        if(this.pythonEditorDoc.isUntitled && this.pythonEditorDoc.getText() == "") {
            areplUtils.insertDefaultImports(this.pythonEditor)
        }
        
        return this.startAndBindPython().then(()=>{
            let panel = this.previewContainer.start(basename(this.pythonEditorDoc.fileName), this.PythonEvaluator);
            panel.onDidDispose(()=>this.dispose(), this, this.subscriptions)
            this.subscriptions.push(panel)

            this.subscribeHandlersToDoc()
            return panel;
        })
    }

    runArepl(){
        this.onAnyDocChange(this.pythonEditorDoc)
    }

    /**
     * adds print() or print(dir()) if line ends in .
     * ex: x=1; print(x)
     * Then runs it
     */
    printDir(){

        if(this.pythonEditor != vscode.window.activeTextEditor) return
        const selection = this.pythonEditor.selection
        if(!selection.isSingleLine) return
        let codeLines = this.pythonEditor.document.getText()

        let codeLinesArr = printDir(codeLines.split(vscodeUtils.eol(this.pythonEditor.document)), selection.start.line)
        // todo: how to connect this with onAnyDocChange?
    }

    runAreplBlock() {
        const editor = vscode.window.activeTextEditor
        const selection = editor.selection
        let block: vscode.Range = null;

        if(selection.isEmpty){ // just a cursor
            block = vscodeUtils.getBlockOfText(editor, selection.start.line)
        }
        else{
            block = new vscode.Range(selection.start, selection.end)
        }
           
        let codeLines = editor.document.getText(block)
        // hack: we want accurate line # info
        // so we prepend lines to put codeLines in right spot
        codeLines = vscodeUtils.eol(editor.document).repeat(block.start.line) + codeLines
        const filePath = editor.document.isUntitled ? "" : editor.document.fileName
        const settingsCached = settings()
        const data: ExecArgs = {
            evalCode: codeLines,
            filePath,
            savedCode: '',
            usePreviousVariables: true,
            show_global_vars: settingsCached.get<boolean>('showGlobalVars'),
            default_filter_vars: settingsCached.get<string[]>('defaultFilterVars'),
            default_filter_types: settingsCached.get<string[]>('defaultFilterTypes')
        }
        this.previewContainer.clearStoredData()
        this.PythonEvaluator.execCode(data)
        this.runningStatus.show()

        if(editor){
            editor.setDecorations(this.highlightDecorationType, [block])
        }

        setTimeout(()=>{
            // clear decorations
            editor.setDecorations(this.highlightDecorationType, [])
        }, 100)
    }

    dispose() {
        vscode.commands.executeCommand("setContext", "arepl", false)

        if(this.PythonEvaluator.pyshell != null && this.PythonEvaluator.pyshell.childProcess != null){
            this.PythonEvaluator.stop()
        }

        this.disposable = vscode.Disposable.from(...this.subscriptions);
        this.disposable.dispose();

        this.runningStatus.dispose();
        
        this.reporter.sendFinishedEvent(settings())
        this.reporter.dispose();

        if(vscode.window.activeTextEditor){
            vscode.window.activeTextEditor.setDecorations(this.previewContainer.errorDecorationType, [])
        }
        this.highlightDecorationType.dispose()
    }

    /**
     * show err message to user if outdated version of python
     */
    private warnIfOutdatedPythonVersion(pythonPath: string){
        PythonShell.getVersion(`"${pythonPath}"`).then((out)=>{
            let version = out.stdout ? out.stdout : out.stderr
            if(version?.includes("Python 3.4") || version?.includes("Python 2")){
                vscode.window.showErrorMessage(`AREPL does not support ${version}.
                Please upgrade or set AREPL.pythonPath to a diffent python.
                AREPL needs python 3.5 or greater`)
            }
            if(version){
                this.reporter.pythonVersion = version.trim()
            }
        }).catch((err: NodeJS.ErrnoException)=>{
            // if we get spawn error here thats already reported by telemetry
            // so we skip telemetry reporting for this error
            console.error(err)
            if(err.message.includes("Python was not found but can be installed from the Microsoft Store")){
                vscode.window.showErrorMessage(err.message)
            }
        })
    }

    /**
     * starts AREPL python backend and binds print&result output to the handlers
     */
    private async startAndBindPython(){
        const pythonPath = areplUtils.getPythonPath()
        const pythonOptions = settings().get<string[]>("pythonOptions")

        this.warnIfOutdatedPythonVersion(pythonPath)

        // basically all this does is load a file.. why does it need to be async *sob*
        const env = await this.loadAndWatchEnvVars()

        this.PythonEvaluator = new PythonEvaluator({
            pythonOptions,
            pythonPath,
            env,
        })
        
        try {
            this.PythonEvaluator.start()
        } catch (err) {
            if (err instanceof Error){
                const error = `Error running python with command: ${pythonPath} ${pythonOptions.join(' ')}\n${err.stack}`
                this.previewContainer.displayProcessError(error);
                // @ts-ignore 
                this.reporter.sendError(err, error.errno, 'spawn')            
            }
            else{
                console.error(err)
            }
        }
        this.PythonEvaluator.pyshell.childProcess.on("error", (err: NodeJS.ErrnoException) => {
            /* The 'error' event is emitted whenever:
            The process could not be spawned, or
            The process could not be killed, or
            Sending a message to the child process failed.
            */

            // @ts-ignore err is actually SystemError but node does not type it
            const error = `Error running python with command: ${err.path} ${err.spawnargs.join(' ')}\n${err.stack}`
            this.previewContainer.displayProcessError(error);
            this.reporter.sendError(err, err.errno, 'spawn')
        })
        this.PythonEvaluator.pyshell.childProcess.on("exit", err => {
            if(!err) return // normal exit
            this.previewContainer.displayProcessError(`err code: ${err}`);
            this.reporter.sendError(new Error('exit'), err, 'spawn')
        })

        this.toAREPLLogic = new ToAREPLLogic(this.PythonEvaluator, this.previewContainer)

        // binding this to the class so it doesn't get overwritten by PythonEvaluator
        this.PythonEvaluator.onPrint = this.previewContainer.handlePrint.bind(this.previewContainer)
        // this is bad - stderr should be handled seperately so user is aware its different
        // but better than not showing stderr at all, so for now printing it out and ill fix later
        this.PythonEvaluator.onStderr = this.previewContainer.handlePrint.bind(this.previewContainer)
        this.PythonEvaluator.onResult = result => {
            this.runningStatus.hide()
            this.previewContainer.handleResult(result)
        }
    }

    /**
     * binds various funcs to activate upon edit of document / switching of active doc / etc...
     */
    private subscribeHandlersToDoc(){

        if(settings().get<boolean>("skipLandingPage")){
            this.onAnyDocChange(this.pythonEditorDoc);
        }

        
        vscode.workspace.onDidSaveTextDocument((e) => {
            if(settings().get<string>("whenToExecute") == "onSave"){
                this.onAnyDocChange(e)
            }
        }, this, this.subscriptions)
        
        vscode.workspace.onDidChangeTextDocument((e) => {
            const cachedSettings = settings()
            if(cachedSettings.get<string>("whenToExecute") == "afterDelay"){
                let delay = cachedSettings.get<number>("delay");
                const restartExtraDelay = cachedSettings.get<number>("restartDelay");
                delay += this.toAREPLLogic.restartMode ? restartExtraDelay : 0
                this.PythonEvaluator.debounce(this.onAnyDocChange.bind(this, e.document), delay)
            }
        }, this, this.subscriptions)
        
        vscode.workspace.onDidCloseTextDocument((e) => {
            if(e == this.pythonEditorDoc) this.dispose()
        }, this, this.subscriptions)
    }


    private onAnyDocChange(event: vscode.TextDocument){
        if(event == this.pythonEditorDoc){

            this.reporter.numRuns += 1
            if(this.PythonEvaluator.executing){
                this.reporter.numInterruptedRuns += 1
            }

            const text = event.getText()

            let filePath = ""
            if(this.pythonEditorDoc.isUntitled){
                /* user would assume untitled file is in same dir as workspace root */
                filePath = join(vscodeUtils.getCurrentWorkspaceFolder(false), this.pythonEditorDoc.fileName)
            }
            else{
                filePath = this.pythonEditorDoc.fileName
            }

            try {
                this.previewContainer.clearStoredData()
                const codeRan = this.toAREPLLogic.onUserInput(text, filePath, vscodeUtils.eol(event), settings().get<boolean>('showGlobalVars'))
                if(codeRan) this.runningStatus.show();
            } catch (error) {
                if(error instanceof Error){
                    if(error.message == "unsafeKeyword"){
                        const unsafeKeywords = settings().get<string[]>('unsafeKeywords')
                        this.previewContainer.updateError(null, `unsafe keyword detected. 
Doing irreversible operations like deleting folders is very dangerous in a live editor. 
If you want to continue please clear arepl.unsafeKeywords setting. 
Currently arepl.unsafeKeywords is set to ["${unsafeKeywords.join('", "')}"]`, true)
                        return
                    }
                    else{
                        console.error(error)
                        this.reporter.sendError(error)
                        this.previewContainer.updateError(null, `internal arepl error: ${error.name} stack: ${error.stack}`, true) 
                    }
                }
                throw error;
            }
        }        
    }
}
