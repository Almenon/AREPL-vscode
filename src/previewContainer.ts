import {PythonResult} from "arepl-backend"
#import * as vscode from "vscode"
import PythonPanelPreview from "./pythonPanelPreview"
import {settings} from "./settings"
import PythonInlinePreview from "./pythonInlinePreview"
import Reporter from "./telemetry"

/**
 * logic wrapper around html preview doc
 */
export class PreviewContainer{
    public printResults: string[] = [];
    private vars = {}
    private pythonPanelPreview: PythonPanelPreview
    private pythonInlinePreview: PythonInlinePreview

    constructor(private reporter: Reporter, context: vscode.ExtensionContext, htmlUpdateFrequency=50){
        this.pythonPanelPreview = new PythonPanelPreview(context, htmlUpdateFrequency);
        this.pythonInlinePreview = new PythonInlinePreview(reporter, context)
    }

    public start(){
        this.clearStoredData()
        return this.pythonPanelPreview.start()
    }

    /**
     * clears stored data (preview gui is unaffected)
     */
    public clearStoredData(){
        this.vars = {}
        this.printResults = []
    }

    public handleResult(pythonResults: PythonResult){
        try {
            this.logTimes(pythonResults)

            this.handleInternalError(pythonResults)
            this.pythonPanelPreview.updateError(pythonResults.userErrorMsg)
            this.pythonInlinePreview.updateErrorGutterIcons(pythonResults.userErrorMsg, settings().get('inlineResults'))

            this.updateVarsWithDumpOutput(pythonResults)
            if(this.shouldUpdateVars(pythonResults)) this.pythonPanelPreview.updateVars(this.vars)

            this.updateTime(pythonResults)
            this.pythonPanelPreview.updateCustomCSS(settings().get('customCSS'))

            this.pythonPanelPreview.throttledRenderPage()
            
            if(this.printResults.length == 0) this.pythonPanelPreview.clearPrint()
            if(pythonResults.done) this.clearStoredData()
        } catch (error) {
            if(error instanceof Error || error instanceof String){
                vscode.window.showErrorMessage("Internal AREPL Error: " + error.toString(), "Report bug").then((action)=>{
                    if(action == "Report bug"){
                        const bugReportLink = vscode.Uri.parse("https://github.com/Almenon/AREPL-vscode/issues/new")
                        vscode.env.openExternal(bugReportLink)
                    }
                })
            }
            if(error instanceof Error){
                this.reporter.sendError(error)
            }
            else{
                // in JS an error might NOT be an error???
                // god i hate JS error handling
                this.reporter.sendError(new Error(error))
            }

            throw error;
        }
    }

    private logTimes(pythonResults:PythonResult){
        console.debug(`Exec time: ${pythonResults.execTime}`)
        console.debug(`Python time: ${pythonResults.totalPyTime}`)
        console.debug(`Total time: ${pythonResults.totalTime}`)
    
        this.reporter.execTime += pythonResults.execTime
        this.reporter.totalPyTime += pythonResults.totalPyTime
        this.reporter.totalTime += pythonResults.totalTime
    }

    /**
     * If there's a internal error report it to telemetry & override pythonResults.userErrorMsg to show it
     */
    private handleInternalError(pythonResults:PythonResult){
            
        if(!pythonResults.userErrorMsg){
            pythonResults.userErrorMsg = ""
        }

        if(pythonResults.internalError){
            // todo: change backend code to send error name

            // first word of last line is usually error name
            const lastLine = pythonResults.internalError.trimRight().split('\n')
            const firstWordOfLastLine = lastLine.pop().split(' ')[0].replace(':', '')

            const error = new Error(firstWordOfLastLine)
            error.stack = pythonResults.internalError

            this.reporter.sendError(error, 0, 'python.internal')
            pythonResults.userErrorMsg = pythonResults.internalError
        }

    }

    /**
     * user may dump var(s), which we format into readable output for user. 
     * Side-effect: this.vars is mutated
     * @param pythonResults result with either "dump output" key or caller and lineno
     */
    private updateVarsWithDumpOutput(pythonResults: PythonResult){
        if(!pythonResults.done){
            const lineKey = "line " + pythonResults.lineno
            if(pythonResults.userVariables["dump output"] != undefined){
                const dumpOutput = pythonResults.userVariables["dump output"]
                pythonResults.userVariables = {}
                pythonResults.userVariables[lineKey] = dumpOutput
            }
            else{
                const v = pythonResults.userVariables
                pythonResults.userVariables = {}
                pythonResults.userVariables[pythonResults.caller + " vars " + lineKey] = v
            }
        }
        this.vars = {...this.vars, ...pythonResults.userVariables}
    }

    private shouldUpdateVars(pythonResults:PythonResult){

        // syntax errors have msg attribute
        const syntaxError = pythonResults.userError && 'msg' in pythonResults.userError

        // a result with a syntax error will not have any variables
        // So only update vars if there's not a syntax error
        // this is because it's annoying to user if they have a syntax error and all their variables dissapear
        return !syntaxError
    }

    private updateTime(pythonResults:PythonResult){
        if(pythonResults.done){
            // exec time is the 'truest' time that user cares about
            this.pythonPanelPreview.updateTime(pythonResults.execTime);
        }
    }

    /**
     * @param refresh Defaults to false. If true updates page immediately. Otherwise error will show up whenever updateContent is called
     */
    public updateError(err: string, refresh=false){
        this.pythonPanelPreview.updateError(err, refresh)
    }

    public clearErrorGutterIcons(){
        this.pythonInlinePreview.clearErrorGutterIcons()
    }

    public handlePrint(pythonResults: string){
        this.printResults.push(pythonResults);
        this.pythonPanelPreview.handlePrint(this.printResults.join('\n'))
    }

    public displayProcessError(err: string){
        this.pythonPanelPreview.displayProcessError(err)
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this.pythonPanelPreview.onDidChange
    }
}