import {PythonExecutors, ExecArgs} from "arepl-backend"
import {PreviewContainer} from "./previewContainer"
import {settings} from "./settings"

/**
 * formats text for passing into AREPL backend
 */
export class ToAREPLLogic{

    lastCodeSection = ""
    lastEndSection = ""

    constructor(private PythonExecutor: PythonExecutors, private previewContainer: PreviewContainer){

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
    
        let startLineNum = 0
        let endLineNum = codeLines.length

        codeLines.forEach((line, i) => {
            if(line.trimEnd().endsWith("#$end")){
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
            show_global_vars: showGlobalVars,
            default_filter_vars: settingsCached.get<string[]>('defaultFilterVars'),
            default_filter_types: settingsCached.get<string[]>('defaultFilterTypes')
        }

        // user should be able to rerun code without changing anything
        // only scenario where we dont re-run is if just end section is changed
        if(endSection != this.lastEndSection && data.evalCode == this.lastCodeSection){
            return false
        }

        this.lastCodeSection = data.evalCode
        this.lastEndSection = endSection
        
        this.PythonExecutor.execCode(data)

        return true
    }

}
