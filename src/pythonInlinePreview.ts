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

            while(error != null){
                let moreDecorations = error.stack["py/seq"].map(frame => {
                    const lineNum = frame.lineno-1 // python trace uses 1-based indexing but vscode lines start at 0
                    const range = new vscode.Range(lineNum, 0, lineNum, 0)
                    const text = error._str ? error._str : error.exc_type["py/type"]
                    return {
                        range,
                        renderOptions: {
                            after: {
                                contentText: text
                            }
                        }
                    } as vscode.DecorationOptions
                })
                decorations = decorations.concat(moreDecorations);
                // todo: update backend so this is a valid type
                // @ts-ignore
                error = error.__context__;
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
