import {PythonEvaluator, ExecArgs} from "arepl-backend"
import {PreviewContainer} from "./previewContainer"
import pyGuiLibraryIsPresent from "./pyGuiLibraryIsPresent"
import {settings} from "./settings"

/**
 * formats text for passing into AREPL backend
 * Along the way decides whether backend needs restarting
 */
export class ToAREPLLogic{

    restartMode: boolean
    restartedLastTime = false
    lastSavedSection = ""
    lastCodeSection = ""
    lastEndSection = ""

    constructor(private PythonEvaluator: PythonEvaluator, private previewContainer: PreviewContainer){

    }

    public scanForUnsafeKeywords(text: string, unsafeKeywords: string[]=[]){
        const commentChar = "#"

        // user may try to clear setting just by deleting word
        // in that case make sure its cleared correctly
        if(unsafeKeywords.length == 1 && unsafeKeywords[0].trim() == '') unsafeKeywords = []
        if(unsafeKeywords.length == 0) return false
        const unsafeKeywordsRe = new RegExp(`^[^${commentChar}]*${unsafeKeywords.join('|')}`)

        return unsafeKeywordsRe.test(text)
    }

    public onUserInput(text: string, filePath: string, eol: string, showGlobalVars=true) {

        const settingsCached = settings()

        let codeLines = text.split(eol)
    
        let savedLines: string[] = []
        let startLineNum = 0
        let endLineNum = codeLines.length

        codeLines.forEach((line, i) => {
            if(line.trimRight().endsWith("#$save")){
                savedLines = codeLines.slice(0, i + 1)
                startLineNum = i+1
            }
            if(line.trimRight().endsWith("#$end")){
                endLineNum = i+1
                return
            }
        });
        const endSection = codeLines.slice(endLineNum).join(eol)
        codeLines = codeLines.slice(startLineNum, endLineNum)
    
        const unsafeKeywords = settingsCached.get<string[]>('unsafeKeywords')
        const realTime = settingsCached.get<string>("whenToExecute") == "afterDelay"
        // if not real-time we trust user to only run safe code
        if(realTime && this.scanForUnsafeKeywords(codeLines.join(eol), unsafeKeywords)){
            throw Error("unsafeKeyword")
        }

        const data: ExecArgs = {
            evalCode: codeLines.join(eol),
            filePath,
            savedCode: savedLines.join(eol),
            usePreviousVariables: settingsCached.get<boolean>('keepPreviousVars'),
            showGlobalVars,
            default_filter_vars: settingsCached.get<string[]>('defaultFilterVars'),
            default_filter_types: settingsCached.get<string[]>('defaultFilterTypes')
        }

        // user should be able to rerun code without changing anything
        // only scenario where we dont re-run is if just end section is changed
        if(endSection != this.lastEndSection && data.savedCode == this.lastSavedSection && data.evalCode == this.lastCodeSection){
            return false
        }

        this.lastCodeSection = data.evalCode
        this.lastSavedSection = data.savedCode
        this.lastEndSection = endSection
    
        this.restartMode = pyGuiLibraryIsPresent(text)
        
        if(this.restartMode) {
            this.checkSyntaxAndRestart(data)
        }
        else if(this.restartedLastTime){ // if GUI code is gone need one last restart to get rid of GUI
            this.restartPython(data)
            this.restartedLastTime = false;
        }
        else{                
            this.PythonEvaluator.execCode(data)
        }

        return true
    }

    /**
     * checks syntax before restarting - if syntax error it doesnt bother restarting but instead just shows syntax error
     * This is useful because we want to restart as little as possible
     */
    private checkSyntaxAndRestart(data: {evalCode: string, savedCode: string, filePath: string}){
        let syntaxPromise: Promise<{}>
    
        // #22 it might be faster to use checkSyntaxFile but this is simpler
        syntaxPromise = this.PythonEvaluator.checkSyntax(data.savedCode + data.evalCode)

        syntaxPromise.then(() => {
            this.restartPython(data)
            this.restartedLastTime = true
        })
        .catch((error: NodeJS.ErrnoException|string) => {
            
            // an ErrnoException is a bad internal error
            let internalErr = ""
            if(typeof(error) != "string"){
                internalErr = error.message + '\n\n' + error.stack
                error = ""
            }

            // todo: refactor above to call arepl to check syntax so we get a actual error object back instead of error text

            this.previewContainer.handleResult(
                {
                    userVariables:{}, userError:null, userErrorMsg:<string>error, execTime: 0, totalPyTime: 0, totalTime: 0,
                    internalError: internalErr, caller: "", lineno: -1, done: true,
                }
            )
        })
    }
    
    private restartPython(data: {evalCode: string, savedCode: string, filePath: string}){
        this.previewContainer.clearStoredData()
        this.PythonEvaluator.restart(
            this.PythonEvaluator.execCode.bind(this.PythonEvaluator, data)
        );     
    }
}
