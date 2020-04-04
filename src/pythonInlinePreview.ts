import * as vscode from "vscode"
import Reporter from "./telemetry"
import { UserError, FrameSummary } from "arepl-backend";
import Utilities, {DefaultDict} from "./utilities";

/**
 * shows error icons
 */
export default class PythonInlinePreview{
    public printResults: string[];
    public errorDecorationType: vscode.TextEditorDecorationType

    constructor(private reporter: Reporter, context: vscode.ExtensionContext){
        this.errorDecorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: context.asAbsolutePath('media/red.jpg'),
        })
    }

    /**
     * Safe - catches and logs any exceptions
     */
    public showInlineErrors(error: UserError, userErrorMsg: string){
        try {

            if(userErrorMsg.includes("AREPL has ran into an error")){
                // this.showInternalError(userErrorMsg)
                // return
            }

            const decorations = this.convertErrorToDecorationOptions(error)
            
            if(vscode.window.activeTextEditor){
                vscode.window.activeTextEditor.setDecorations(
                    // <string> indicates the main arepl file
                    this.errorDecorationType, decorations["<string>"]
                )
            }

        } catch (internalError) {
            if(internalError instanceof Error){
                this.reporter.sendError(internalError)
            }
            else{
                this.reporter.sendError(new Error(internalError))
            }
        }
    }

    private showInternalError(internalError: string){
        throw Error('not implemented')
    }

    private convertFrameToDecorationOption(frame: FrameSummary): vscode.DecorationOptions{
        const lineNum = frame.lineno-1 // python trace uses 1-based indexing but vscode lines start at 0
        // todo: pull endCharNum from relevant line from file
        // remember that the file might not be the active doc...
        const endCharNum = 0
        const range = new vscode.Range(lineNum, 0, lineNum, endCharNum)
        // temporarily skip error text untill above todo is fixed
        // _str might be empty if user raised an error while leaving message empty
        //const text = error._str ? error._str : error.exc_type["py/type"]
        const text = ""
        return {
            range,
            renderOptions: {
                after: {
                    contentText: text
                }
            }
        }
    }

    /**
     * converts error to dictionary of error decorations indexed by filename
     */
    private convertErrorToDecorationOptions(error: UserError): Record<string, vscode.DecorationOptions[]>{
        const decorations = new DefaultDict(Array)

        if(Utilities.isEmpty(error)) return {'<string>': []};

        const flattenedErrors = Utilities.flattenNestedObjectWithMultipleKeys(error, ["__context__", "__cause__"])

        flattenedErrors.forEach(error => {
            error.stack["py/seq"].forEach(frame => {
                decorations[frame.filename].push(this.convertFrameToDecorationOption(frame))
            })
        })

        // @ts-ignore no idea how to type defaultdict properly
        return decorations
    }
}
