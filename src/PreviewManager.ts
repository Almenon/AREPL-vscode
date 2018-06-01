'use strict'
import * as vscode from 'vscode'
import HtmlDocumentContentProvider from './HTMLDocumentContentProvider'
import pyGuiLibraryIsPresent from './pyGuiLibraryIsPresent'
import {PythonEvaluator} from 'arepl-backend'
import Reporter from './telemetry'
import {EOL} from 'os'

// This class initializes the previewmanager based on extension type and manages all the subscriptions
export default class PreviewManager {

    reporter: Reporter;
    restartMode: boolean;
    pythonPreviewContentProvider: HtmlDocumentContentProvider;
    disposable: vscode.Disposable;
    pythonEditor: vscode.TextDocument;
    pythonEvaluator: PythonEvaluator;
    restartedLastTime = false;
    status: vscode.StatusBarItem;
    settings:vscode.WorkspaceConfiguration;

    constructor(context: vscode.ExtensionContext) {

        this.settings = vscode.workspace.getConfiguration('AREPL');
        this.pythonPreviewContentProvider = new HtmlDocumentContentProvider(context);
        this.pythonEditor = vscode.window.activeTextEditor.document;
        this.reporter = new Reporter(this.settings.get<boolean>('telemetry'))
        this.status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.status.text = "Running python..."
        this.status.tooltip = "AREPL is currently running your python file.  Close the AREPL preview to stop"
        
        
        vscode.workspace.registerTextDocumentContentProvider(HtmlDocumentContentProvider.scheme, this.pythonPreviewContentProvider);
        
        /////////////////////////////////////////////////////////
        //		python
        /////////////////////////////////////////////////////////
        let pythonPath = this.settings.get<string>('pythonPath')
        let pythonOptions = this.settings.get<string[]>('pythonOptions')

        this.pythonEvaluator = new PythonEvaluator(pythonPath, pythonOptions)

        let debounce = this.settings.get<number>('delay');
        let restartExtraDebounce = this.settings.get<number>('restartDelay');
        
        this.pythonEvaluator.startPython()
        this.pythonEvaluator.pyshell.childProcess.on('error', err => {
            let error:any = err; //typescript complains about type for some reason so defining to any
            this.pythonPreviewContentProvider.handleSpawnError(error.path, error.spawnargs[0], error.stack);
            this.reporter.sendError("error starting python: " + error.path)
        })

        // binding this to the class so it doesn't get overwritten by PythonEvaluator
        this.pythonEvaluator.onPrint =  this.pythonPreviewContentProvider.handlePrint.bind(this.pythonPreviewContentProvider)
        this.pythonEvaluator.onResult = this.handleResult.bind(this)

        /////////////////////////////////////////////////////////
        // doc stuff
        /////////////////////////////////////////////////////////

        if(this.pythonEditor.isUntitled && this.pythonEditor.getText() == ""){
            this.insertDefaultImports(vscode.window.activeTextEditor)
        }

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

    private insertDefaultImports(editor: vscode.TextEditor){
        editor.edit((editBuilder)=>{
            let imports = this.settings.get<string[]>("defaultImports")

            imports = imports.map((i)=>{
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
            let text = event.getText()
            let filePath = this.pythonEditor.isUntitled ? "" : this.pythonEditor.fileName
            this.onUserInput(text, filePath)
        }        
    }

    private onUserInput(text: string, filePath:string) {
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
                evalCode: codeLines.join('\n'),
                filePath: filePath
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
                    this.pythonPreviewContentProvider.handleResult({'userVariables':{},'userError':error, execTime: 0, totalPyTime: 0, totalTime: 0, internalError: "", caller: "", linenno: -1, done:true})
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

    private handleResult(pythonResults: {userError:string, userVariables:Object, execTime:number, totalPyTime:number, totalTime:number, internalError:string, caller: string, linenno:number, done: boolean}){
        this.status.hide()
        this.pythonPreviewContentProvider.handleResult(pythonResults)
        if(pythonResults.userError.startsWith("Sorry, AREPL has ran into an error")){
            this.reporter.sendError(pythonResults.userError)
        }
    }

    private restartPython(data){
        this.pythonPreviewContentProvider.printResults = []
        this.pythonPreviewContentProvider.updateError("", true)
        this.pythonEvaluator.restart(
            this.pythonEvaluator.execCode.bind(this.pythonEvaluator, data)
        );     
    }
}