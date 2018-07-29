"use strict"
import * as path from "path";
import * as vscode from "vscode"
import {Limit} from "./throttle"
import Utilities from "./utilities"

/**
 * very simple read-only html content
 * https://code.visualstudio.com/docs/extensionAPI/vscode-api#_a-nametextdocumentcontentprovider
 */
export default class PythonPreview implements vscode.TextDocumentContentProvider {
    
    static readonly scheme = "pythonPreview"
    static readonly PREVIEW_URI = PythonPreview.scheme + "://authority/preview"
    public throttledUpdate: () => void

    private _onDidChange: vscode.EventEmitter<vscode.Uri>;
    private settings: vscode.WorkspaceConfiguration;
    private lastTime: number = 999999999;

    private html;
    
    private readonly landingPage = `
    <br>
    <p style="font-size:14px">Start typing or make a change and your code will be evaluated.</p>
    
    <p style="font-size:14px">⚠ <b style="color:red">WARNING:</b> code is evaluated WHILE YOU TYPE - don't mess around with your file system! ⚠</p>
    <p>evaluation while you type can be turned off or adjusted in the settings</p>
    <br>
    <h3>New Features with version 1.3!</h3>
    Don't like real-time execution? In the settings you can turn on execute on save or execute on keybinding.
    <br>
    
    <h3>Examples</h3>
    
    <h4>Simple List</h4>
    <code style="white-space:pre-wrap">
    x = [1,2,3]
    y = [num*2 for num in x]
    print(y)
    </code>

    <h4>Dumping</h4>
    <code style="white-space:pre-wrap">
    from arepldump import dump 

    def milesToKilometers(miles):
        kilometers = miles*1.60934
        dump() # dumps all the vars in your function

        # or dump when function is called for a second time
        dump(None,1) 

    milesToKilometers(2*2)
    milesToKilometers(3*3)

    for char in ['a','b','c']:
        dump(char,2) # dump a var at a specific iteration

    a=1
    dump(a) # dump specific vars at any point in your program
    a=2
    </code>
    
    <h4>Turtle</h4>
    <code style="white-space:pre-wrap">
    import turtle
    
    # window in right hand side of screen
    turtle.setup(500,500,-1,0)
    
    turtle.forward(100)
    turtle.left(90)
    </code>
    
    <h4>Web call</h4>
    <code style="white-space:pre-wrap">
    import requests
    import datetime as dt
    
    r = requests.get("https://api.github.com")
    
    #$save
    # #$save saves state so request is not re-executed when modifying below
    
    now = dt.datetime.now()
    if r.status_code == 200:
        print("API up at " + str(now))
    
    </code>`;
    private readonly footer = `<br><br>
        <div id="footer">
        <p style="margin:0px;">
            report an <a href="https://github.com/almenon/arepl-vscode/issues">issue</a>  |
            ⭐ <a href="https://marketplace.visualstudio.com/items?itemName=almenon.arepl#review-details">rate me</a> ⭐ |
            talk on <a href="https://gitter.im/arepl/lobby">gitter</a> |
                <a href="https://twitter.com/intent/tweet?button_hashtag=arepl" id="twitterButton">
                    <i id="twitterIcon"></i>Tweet #arepl</a>
        </p>
        </div>`

    private css: string
    private jsonRendererScript: string;
    private errorContainer = ""
    private jsonRendererCode = `<div id="results"></div>`;
    private emptyPrint = `<br><b>Print Output:</b><div id="print"></div>`
    private printContainer = this.emptyPrint;
    private timeContainer = ""

    constructor(private context: vscode.ExtensionContext) {
        this._onDidChange = new vscode.EventEmitter<vscode.Uri>();
        this.css = `<link rel="stylesheet" type="text/css" href="${this.getMediaPath("pythonPreview.css")}">`
        this.jsonRendererScript = `<script src="${this.getMediaPath("jsonRenderer.js")}"></script>`
        this.settings = vscode.workspace.getConfiguration("AREPL");
        this.html = this.landingPage;

        // refreshing html too much can freeze vscode... lets avoid that
        const l = new Limit()
        this.throttledUpdate = l.throttledUpdate(this.updateContent, 50)
    }

    provideTextDocumentContent(uri: vscode.Uri): string {
        return this.html;
    };

    public updateVars(vars: object){
        let userVarsCode = `userVars = ${JSON.stringify(vars)};`

        // escape end script tag or else the content will escape its container and WREAK HAVOC
        userVarsCode = userVarsCode.replace(/<\/script>/g, "<\\/script>")

        this.jsonRendererCode = `<script>
            window.onload = function(){
                ${userVarsCode}
                let jsonRenderer = renderjson.set_icons('+', '-') // default icons look a bit wierd, overriding
                    .set_show_to_level(${this.settings.get("show_to_level")}) 
                    .set_max_string_length(${this.settings.get("max_string_length")});
                document.getElementById("results").appendChild(jsonRenderer(userVars));
            }
            </script>`
    }

    public updateTime(time: number){
        let color: "green"|"red";

        time = Math.floor(time) // we dont care about anything smaller than ms
        
        if(time > this.lastTime) color = "red"
        else color = "green"

        this.lastTime = time;

        this.timeContainer = `<p style="position:fixed;left:90%;top:90%;color:${color};">${time} ms</p>`;
    }

    /**
     * @param refresh if true updates page immediately.  otherwise error will show up whenever updateContent is called
     */
    public updateError(err: string, refresh=false){
        // escape the <module>
        err = Utilities.escapeHtml(err)

        err = this.makeErrorGoogleable(err)

        this.errorContainer = `<div id="error">${err}</div>`

        if(refresh) this.throttledUpdate()
    }

    public handlePrint(printResults: string){
        // escape any accidental html
        printResults = Utilities.escapeHtml(printResults);

        this.printContainer = `<br><b>Print Output:</b><div id="print">${printResults}</div>`
        this.throttledUpdate();
    }

    clearPrint(){
        this.printContainer = this.emptyPrint
    }

    public handleSpawnError(pythonCommand: string, pythonPath: string, err: string){
        let errMsg = `Error in the AREPL extension!\nWhile running python ${pythonCommand} ${pythonPath} we got ${err}`
        if(err.includes("ENOENT")){
            errMsg = errMsg + "\n\nAre you sure you have installed python 3 and it is in your PATH?"
        }

        this.updateError(errMsg)
        this.throttledUpdate()
    }

    private makeErrorGoogleable(err: string){
        if(err && err.trim().length > 0){
            let errLines = err.split("\n")

            // exception usually on last line so start from bottom
            for(let i=errLines.length-1; i>=0; i--){

                // most exceptions follow format ERROR: explanation
                // ex: json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
                // so we can identify them by a single word at start followed by colon
                const errRegex = /(^[\w\.]+): /

                if(errLines[i].match(errRegex)){
                    const googleLink = "https://www.google.com/search?q=python "
                    errLines[i] = errLines[i].link(googleLink + errLines[i])
                }
            }

            return errLines.join("\n")
        }
        else return err
    }

    private update() {
        this._onDidChange.fire(vscode.Uri.parse(PythonPreview.PREVIEW_URI));
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    private getMediaPath(mediaFile: string): string {
        // stolen from https://github.com/Microsoft/vscode/tree/master/extensions/markdown
        return vscode.Uri.file(this.context.asAbsolutePath(path.join('media', mediaFile))).toString();
    }

    private updateContent(){

        const printPlacement = this.settings.get<string>("printResultPlacement")
        const showFooter = this.settings.get<boolean>("showFooter")

        // todo: handle different themes.  check body class: https://code.visualstudio.com/updates/June_2016
        this.html = `<head>
            ${this.css}
            ${this.jsonRendererScript}
            ${this.jsonRendererCode}
        </head>
        <body>
            ${this.errorContainer}
            ${printPlacement == "bottom" ? 
                '<div id="results"></div>' + this.printContainer : 
                this.printContainer + '<div id="results"></div>'}
            ${this.timeContainer}
            ${showFooter ? this.footer : ""}
        </body>`

        // issue #1: need to make sure html is new each time or wierd crap happens
        this.html += `<div id="${Math.random()}" style="display:none"></div>`

        this.update();  
    }
}