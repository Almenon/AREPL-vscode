import {PythonResult, UserError} from "arepl-backend"
import * as vscode from "vscode"
import PythonInlinePreview from "./pythonInlinePreview"
import PythonPanelPreview from "./pythonPanelPreview"
import Reporter from "./telemetry"
import {settings} from "./settings"

/**
 * logic wrapper around html preview doc
 */
export class PreviewContainer{
    public errorDecorationType: vscode.TextEditorDecorationType
    public printResults: string[];
    private vars: {}
    pythonInlinePreview: PythonInlinePreview

    constructor(private reporter: Reporter, context: vscode.ExtensionContext, htmlUpdateFrequency=50, private pythonPanelPreview?: PythonPanelPreview){
        if(!this.pythonPanelPreview) this.pythonPanelPreview = new PythonPanelPreview(context, htmlUpdateFrequency)
        this.pythonInlinePreview = new PythonInlinePreview(reporter, context)
        this.errorDecorationType = this.pythonInlinePreview.errorDecorationType
    }

    public start(linkedFileName: string){
        this.clearStoredData()
        return this.pythonPanelPreview.start(linkedFileName)
    }

    /**
     * clears stored data (preview gui is unaffected)
     */
    public clearStoredData(){
        this.vars = {}
    this.printResults = []
    }

    public handleResult(pythonResults: PythonResult){

        console.debug(`Exec time: ${pythonResults.execTime}`)
        console.debug(`Python time: ${pythonResults.totalPyTime}`)
        console.debug(`Total time: ${pythonResults.totalTime}`)

        this.reporter.execTime += pythonResults.execTime
        this.reporter.totalPyTime += pythonResults.totalPyTime
        this.reporter.totalTime += pythonResults.totalTime

        try {            
            
            if(!pythonResults.done){
                // user has dumped variables, add them to vars
                this.updateVarsWithDumpOutput(pythonResults)
            }
            else{
                // exec time is the 'truest' time that user cares about
                this.pythonPanelPreview.updateTime(pythonResults.execTime);
            }

            this.vars = {...this.vars, ...pythonResults.userVariables}

            if(!pythonResults.userErrorMsg){
                pythonResults.userErrorMsg = ""
            }

            // syntax errors have msg attribute
            const syntaxError = pythonResults.userError && 'msg' in pythonResults.userError

            // a result with a syntax error will not have any variables
            // So only update vars if there's not a syntax error
            // this is because it's annoying to user if they have a syntax error and all their variables dissapear
            if(!syntaxError){
                this.pythonPanelPreview.updateVars(this.vars)
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

            // if it's a syntax error don't clear print results
            // the user might be in the middle of typing something and it would be annoying
            // to have print results suddenly dissapear
            if(!syntaxError && this.printResults.length == 0) this.pythonPanelPreview.clearPrint()
            
            this.updateError(pythonResults.userError, pythonResults.userErrorMsg, false)

            this.pythonPanelPreview.injectCustomCSS(settings().get('customCSS'))
            this.pythonPanelPreview.throttledUpdate()

        } catch (error) {
            if(error instanceof Error || error instanceof String){
                vscode.window.showErrorMessage("Internal AREPL Error: " + error.toString(), "Report bug").then((action)=>{
                    if(action == "Report bug"){
                        const bugReportLink = vscode.Uri.parse(`https://github.com/Almenon/AREPL-vscode/issues/new?template=bug_report.md&title=${error}`)
                        // enable below for vscode version 1.31.0 or higher
                        // vscode.env.openExternal(bugReportLink)
                        vscode.commands.executeCommand('vscode.open', bugReportLink)

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
        }

    }

    public handlePrint(printResult: string){
        this.printResults.push(printResult);
        this.pythonPanelPreview.handlePrint(this.printResults.join(''))
    }

    public updateError(userError: UserError, userErrorMsg: string, refresh: boolean){
        const cachedSettings = settings()
        if(!cachedSettings.get('showNameErrors')){
            if(userError?.exc_type?.["py/type"]?.includes("NameError")){
                console.warn('skipped showing name error - showNameErrors setting is off')
                return
            }
        }
        if(!cachedSettings.get('showSyntaxErrors')){
            if(userError?.exc_type?.["py/type"]?.includes("SyntaxError")){
                console.warn('skipped showing syntax error - SyntaxError setting is off')
                return
            }
        }
        if(cachedSettings.get('inlineResults')){
            this.pythonInlinePreview.showInlineErrors(userError, userErrorMsg)
        }
        this.pythonPanelPreview.updateError(userErrorMsg, refresh)
    }

    public displayProcessError(err: string){
        this.pythonPanelPreview.displayProcessError(err)
    }

    /**
     * user may dump var(s), which we format into readable output for user
     * @param pythonResults result with either "dump output" key or caller and lineno
     */
    private updateVarsWithDumpOutput(pythonResults: PythonResult){
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

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this.pythonPanelPreview.onDidChange
    }
}