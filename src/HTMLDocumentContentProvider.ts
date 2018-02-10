"use strict"
import * as vscode from 'vscode'
import * as path from "path";
import Utilities from './utilities'

/**
 * very simple read-only html content
 * https://code.visualstudio.com/docs/extensionAPI/vscode-api#_a-nametextdocumentcontentprovider
 */
export default class HtmlDocumentContentProvider implements vscode.TextDocumentContentProvider {
    printResults: string[] = [];

    private _onDidChange: vscode.EventEmitter<vscode.Uri>;
    public html = `<p>Start typing or make a change and your code will be evaluated.</p>
                   <br>
                   <p>⚠ WARNING: code is evaluated WHILE YOU TYPE - don't mess around with your file system! ⚠</p>`;
    static readonly scheme = "pythonPreview"
    static readonly PREVIEW_URI = HtmlDocumentContentProvider.scheme + "://authority/preview"

    css:string
    jsonRendererScript: string;
    errorContainer = ''
    userVarContainer = `<div id="results"></div>`;
    printContainer = `<br><b>Print Output:</b><div id="print"></div>`;
    settings:vscode.WorkspaceConfiguration;

    constructor(private context: vscode.ExtensionContext) {
        this._onDidChange = new vscode.EventEmitter<vscode.Uri>();
        this.css = `<link rel="stylesheet" type="text/css" href="${this.getMediaPath("pythonPreview.css")}">`
        this.jsonRendererScript = `<script src="${this.getMediaPath('jsonRenderer.js')}"></script>`
        this.settings = vscode.workspace.getConfiguration('AREPL');
    }

    provideTextDocumentContent(uri: vscode.Uri): string {
        return this.html;
    };

    public update() {
        this._onDidChange.fire(vscode.Uri.parse(HtmlDocumentContentProvider.PREVIEW_URI));
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    /**
     * starts preview
     */
    public register(){
        vscode.workspace.registerTextDocumentContentProvider(HtmlDocumentContentProvider.scheme, this);
    }

    private getMediaPath(mediaFile: string): string {
        // stolen from https://github.com/Microsoft/vscode/tree/master/extensions/markdown
		return vscode.Uri.file(this.context.asAbsolutePath(path.join('media', mediaFile))).toString();
	}

    public updateContent(){
        // todo: handle different themes.  check body class: https://code.visualstudio.com/updates/June_2016
        this.html = this.css + this.jsonRendererScript + this.errorContainer + this.userVarContainer + this.printContainer;

        // issue #1: need to make sure html is new each time or wierd crap happens
        this.html += `<div id="${Math.random()}" style="display:none"></div>`

        this.update();  
    }

    public handleResult(pythonResults: {ERROR:string, userVariables:Object, execTime:number, totalPyTime:number, totalTime:number}){
        console.log(pythonResults.execTime)
        console.log(pythonResults.totalPyTime)
        console.log(pythonResults.totalTime)

        // if no Vars & an error exists then it must be a syntax exception
        // in which case we skip updating because no need to clear out variables
        if(!Utilities.isEmpty(pythonResults.userVariables) || pythonResults.ERROR == ""){
            this.updateVars(pythonResults.userVariables)
        }

        this.updateError(pythonResults.ERROR, true)
        
        //clear print so empty for next program run
        this.printResults = [];
        this.printContainer = `<br><b>Print Output:</b><div></div>`
    }

    private updateVars(vars: Object){
        let userVarsCode = `userVars = ${JSON.stringify(vars)};`

        // escape end script tag or else the content will escape its container and WREAK HAVOC
        userVarsCode = userVarsCode.replace(/<\/script>/g,'<\\/script>')

        let jsonRendererCode = `<script>
                                    ${userVarsCode}
                                    let jsonRenderer = renderjson.set_icons('+', '-') // default icons look a bit wierd, overriding
                                        .set_show_to_level(${this.settings.get('show_to_level')}) 
                                        .set_max_string_length(${this.settings.get('max_string_length')});
                                    document.getElementById("results").appendChild(jsonRenderer(userVars));
                                </script>`

        this.userVarContainer = `<div id="results">${jsonRendererCode}</div>`
    }

    /**
     * @param refresh if true updates page immediately.  otherwise error will show up whenever updateContent is called
     */
    public updateError(err: string, refresh=false){
        // escape the <module>
        err = Utilities.escapeHtml(err)
        this.errorContainer = `<div id="error">${err}</div>`

        if(refresh) this.updateContent()
    }

    public handlePrint(pythonResults:string){
		this.printResults.push(pythonResults);
        let printResults = this.printResults.join('\n')

        // escape any accidental html
        printResults = Utilities.escapeHtml(printResults);

        this.printContainer = `<br><b>Print Output:</b><div id="print">${printResults}</div>`
        this.updateContent();
    }

    public handleSpawnError(pythonCommand:string, pythonPath:string, err:string){
        let errMsg = `Error in the AREPL extension!\nWhile running python ${pythonCommand} ${pythonPath} we got ${err}`
        if (err.includes("ENOENT")) errMsg = errMsg + "\n\nAre you sure you have installed python 3 and it is in your PATH?"

        this.updateError(errMsg)
        this.updateContent()
    }
}