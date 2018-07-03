import {PythonEvaluator} from "arepl-backend"
import {PreviewContainer} from "./previewContainer"
import pyGuiLibraryIsPresent from "./pyGuiLibraryIsPresent"

/**
 * formats text for passing into AREPL backend
 * Along the way decides whether backend needs restarting
 */
export class ToAREPLLogic{

    restartMode: boolean;
    restartedLastTime = false;

    constructor(private pythonEvaluator: PythonEvaluator, private previewContainer: PreviewContainer){

    }

    public onUserInput(text: string, filePath: string) {
        let codeLines = text.split("\n")
    
        let savedLines: string[] = []
        codeLines.forEach((line, i) => {
            if(line.trim().endsWith("#$save")){
                savedLines = codeLines.slice(0, i + 1)
                codeLines = codeLines.slice(i + 1, codeLines.length)
            }
        });
    
        const data = {
            evalCode: codeLines.join("\n"),
            filePath,
            savedCode: savedLines.join("\n"),
        }
    
        this.restartMode = pyGuiLibraryIsPresent(text)
        
        if (this.restartMode) {
            this.checkSyntaxAndRestart(data)
        }
        else if (this.restartedLastTime){ // if GUI code is gone need one last restart to get rid of GUI
            this.restartPython(data)
            this.restartedLastTime = false;
        }
        else{                
            this.pythonEvaluator.execCode(data)
        }
    }

    /**
     * checks syntax before restarting - if syntax error it doesnt bother restarting but instead just shows syntax error
     * This is useful because we want to restart as little as possible
     */
    private checkSyntaxAndRestart(data: {evalCode: string, savedCode: string, filePath: string}){
        let syntaxPromise: Promise<{}>
    
        // #22 it might be faster to use checkSyntaxFile but this is simpler
        syntaxPromise = this.pythonEvaluator.checkSyntax(data.savedCode + data.evalCode)

        syntaxPromise.then(() => {
            this.restartPython(data)
            this.restartedLastTime = true
        })
        .catch((error) => {
            this.previewContainer.handleResult(
                {"userVariables":{},"userError":error, execTime: 0, totalPyTime: 0, totalTime: 0, internalError: "", caller: "", lineno: -1, done: true,}
            )
        })
    }
    
    private restartPython(data: {evalCode: string, savedCode: string, filePath: string}){
        this.previewContainer.printResults = []
        this.previewContainer.updateError("", true)
        this.pythonEvaluator.restart(
            this.pythonEvaluator.execCode.bind(this.pythonEvaluator, data)
        );     
    }
}
