import * as vscode from "vscode"
import Reporter from "./telemetry"
import { UserError } from "arepl-backend";

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
     * sets gutter icons in sidebar. Safe - catches and logs any exceptions
     */
    public updateErrorGutterIcons(error: UserError){
        try {

            let decorations: vscode.DecorationOptions[] = []
            // py/type:"builtins.NameError" <- for error.exc_type
            // error.stack["py/seq"] <- for stack
            // also need to update context and cause to be UserError's

            while(error != null){
                decorations.concat(error.stack.map(frame => {
                    const lineNum = frame.lineno-1 // python trace uses 1-based indexing but vscode lines start at 0
                    const range = new vscode.Range(lineNum, 0, lineNum, 0)
                    const text = error._str ? error._str : error.exc_type
                    return {
                        range,
                        renderOptions: {
                            after: {
                                contentText: text
                            }
                        }
                    } as vscode.DecorationOptions
                }));
                error = error.context as UserError;
            }
            
            if(vscode.window.activeTextEditor){
                vscode.window.activeTextEditor.setDecorations(this.errorDecorationType, decorations)
            }

        } catch (error) {
            if(error instanceof Error){
                this.reporter.sendError(error)
            }
            else{
                this.reporter.sendError(new Error(error))
            }
        }
    }

}
