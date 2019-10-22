import {PythonResult} from "arepl-backend"
import * as vscode from "vscode"
import PythonPanelPreview from "./pythonPanelPreview"
import Reporter from "./telemetry"
import {settings} from "./settings"
import { pythonInlinePreview as PythonInlinePreview } from "./pythonInlinePreview"

/**
 * logic wrapper around html preview doc
 */
export class PreviewContainer{
    public printResults: string[];
    pythonInlinePreview:PythonInlinePreview
    public errorDecorationType: vscode.TextEditorDecorationType
    private vars: {}

    constructor(private reporter: Reporter, context: vscode.ExtensionContext, htmlUpdateFrequency=50, private pythonPanelPreview?: PythonPanelPreview){
        if(!this.pythonPanelPreview) this.pythonPanelPreview = new PythonPanelPreview(context, htmlUpdateFrequency)
        this.pythonInlinePreview = new PythonInlinePreview(reporter, context)
        this.errorDecorationType = this.pythonInlinePreview.errorDecorationType
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

            if(this.printResults.length == 0) this.pythonPanelPreview.clearPrint()

            this.updateError(pythonResults.userErrorMsg)
            if(settings().get('inlineResults')){
                this.pythonInlinePreview.updateErrorGutterIcons(pythonResults.userErrorMsg)
            }

            this.pythonPanelPreview.injectCustomCSS(settings().get('customCSS'))
            this.pythonPanelPreview.throttledUpdate()

            if(pythonResults.done) this.clearStoredData()
        } catch (error) {
            if(error instanceof Error || error instanceof String){
                vscode.window.showErrorMessage("Internal AREPL Error: " + error.toString(), "Report bug").then((action)=>{
                    if(action == "Report bug"){
                        const bugReportLink = vscode.Uri.parse("https://github.com/Almenon/AREPL-vscode/issues/new")
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

    public handlePrint(pythonResults: string){
        this.printResults.push(pythonResults);
        this.pythonPanelPreview.handlePrint(this.printResults.join('\n'))
    }

    /**
     * @param refresh if true updates page immediately.  otherwise error will show up whenever updateContent is called
     */
    public updateError(err: string, refresh=false){
        this.pythonPanelPreview.updateError(err, refresh)
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