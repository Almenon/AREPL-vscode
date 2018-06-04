import pyGuiLibraryIsPresent from './pyGuiLibraryIsPresent'
import HtmlDocumentContentProvider from './HTMLDocumentContentProvider'
import {PythonEvaluator} from 'arepl-backend'
import Reporter from './telemetry'

/**
 * additional interface between AREPL and vscode for input / output
 */
export class pythonInterface{

    restartMode: boolean;
    restartedLastTime = false;

    constructor(private pythonEvaluator:PythonEvaluator, private pythonPreviewContentProvider: HtmlDocumentContentProvider, private reporter:Reporter){

    }

    public onUserInput(text: string, filePath:string) {
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
    
    public handleResult(pythonResults: {userError:string, userVariables:Object, execTime:number, totalPyTime:number, totalTime:number, internalError:string, caller: string, linenno:number, done: boolean}){
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