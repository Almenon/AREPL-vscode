"use strict"
import * as vscode from 'vscode'
import * as path from "path";
import Utilities from './utilities'
import {limit} from './throttle'

/**
 * very simple read-only html content
 * https://code.visualstudio.com/docs/extensionAPI/vscode-api#_a-nametextdocumentcontentprovider
 */
export default class HtmlDocumentContentProvider implements vscode.TextDocumentContentProvider {
    
    public throttledUpdate:()=>void
    public printResults: string[] = [];

    private _onDidChange: vscode.EventEmitter<vscode.Uri>;
    private settings:vscode.WorkspaceConfiguration;
    static readonly scheme = "pythonPreview"
    static readonly PREVIEW_URI = HtmlDocumentContentProvider.scheme + "://authority/preview"
    private lastTime:number = 999999999;

    private html;
    private readonly landingPage = `
    <br>
    <p style="font-size:14px">Start typing or make a change and your code will be evaluated.</p>
    
    <p style="font-size:14px">⚠ <b style="color:red">WARNING:</b> code is evaluated WHILE YOU TYPE - don't mess around with your file system! ⚠</p>
    <p>evaluation while you type can be turned off or adjusted in the settings</p>
    <br>
    <h3>New Features with version 1.0!</h3>
    <li>Improved Landing Page</li>
    <li>Better-looking variable display</li>
    <br>
    
    <h3>Examples</h3>
    
    <h4>Simple List</h4>
    <code style="white-space:pre-wrap">
    x = [1,2,3]
    y = [num*2 for num in x]
    print(y)
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

    private css:string
    private jsonRendererScript: string;
    private errorContainer = ''
    private jsonRendererCode = `<div id="results"></div>`;
    private emptyPrint = `<br><b>Print Output:</b><div id="print"></div>`
    private printContainer = this.emptyPrint;
    private timeContainer = ''

    constructor(private context: vscode.ExtensionContext) {
        this._onDidChange = new vscode.EventEmitter<vscode.Uri>();
        this.css = `<link rel="stylesheet" type="text/css" href="${this.getMediaPath("pythonPreview.css")}">`
        this.jsonRendererScript = `<script src="${this.getMediaPath('jsonRenderer.js')}"></script>`
        this.settings = vscode.workspace.getConfiguration('AREPL');
        this.html = this.landingPage;

        // refreshing html too much can freeze vscode... lets avoid that
        let l = new limit()
        this.throttledUpdate = l.throttledUpdate(this.updateContent, 50)
    }

    provideTextDocumentContent(uri: vscode.Uri): string {
        return this.html;
    };

    private update() {
        this._onDidChange.fire(vscode.Uri.parse(HtmlDocumentContentProvider.PREVIEW_URI));
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    private getMediaPath(mediaFile: string): string {
        // stolen from https://github.com/Microsoft/vscode/tree/master/extensions/markdown
		return vscode.Uri.file(this.context.asAbsolutePath(path.join('media', mediaFile))).toString();
	}

    private updateContent(){

        let printPlacement = this.settings.get<string>("printResultPlacement")
        let showFooter = this.settings.get<boolean>("showFooter")

        // todo: handle different themes.  check body class: https://code.visualstudio.com/updates/June_2016
        this.html = `<head>
            ${this.css}
            ${this.jsonRendererScript}
            ${this.jsonRendererCode}
        </head>
        <body>
            ${this.errorContainer}
            ${printPlacement == "bottom" ? '<div id="results"></div>'+this.printContainer : this.printContainer+'<div id="results"></div>'}
            ${this.timeContainer}
            ${showFooter ? this.footer : ""}
        </body>`

        // issue #1: need to make sure html is new each time or wierd crap happens
        this.html += `<div id="${Math.random()}" style="display:none"></div>`

        this.update();  
    }

    public handleResult(pythonResults: {userError:string, userVariables:Object, execTime:number, totalPyTime:number, totalTime:number, internalError:string, caller: string, linenno:number, done: boolean}){
        console.log(pythonResults.execTime)
        console.log(pythonResults.totalPyTime)
        console.log(pythonResults.totalTime)

        // exec time is the 'truest' time that user cares about
        this.updateTime(pythonResults.execTime);

        // if no Vars & an error exists then it must be a syntax exception
        // in which case we skip updating because no need to clear out variables
        if(!Utilities.isEmpty(pythonResults.userVariables) || pythonResults.userError == ""){
            this.updateVars(pythonResults.userVariables)
        }

        if(this.printResults.length == 0){this.printContainer = this.emptyPrint}

        this.updateError(pythonResults.userError, true)
        
        //clear print so empty for next program run
        this.printResults = [];
    }

    private updateVars(vars: Object){
        let userVarsCode = `userVars = ${JSON.stringify(vars)};`

        // escape end script tag or else the content will escape its container and WREAK HAVOC
        userVarsCode = userVarsCode.replace(/<\/script>/g,'<\\/script>')

        this.jsonRendererCode = `<script>
            window.onload = function(){
                ${userVarsCode}
                let jsonRenderer = renderjson.set_icons('+', '-') // default icons look a bit wierd, overriding
                    .set_show_to_level(${this.settings.get('show_to_level')}) 
                    .set_max_string_length(${this.settings.get('max_string_length')});
                document.getElementById("results").appendChild(jsonRenderer(userVars));
            }
            </script>`
    }

    private updateTime(time:number){
        let color:"green"|"red";

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
        this.errorContainer = `<div id="error">${err}</div>`

        if(refresh) this.throttledUpdate()
    }

    public handlePrint(pythonResults:string){
		this.printResults.push(pythonResults);
        let printResults = this.printResults.join('\n')

        // escape any accidental html
        printResults = Utilities.escapeHtml(printResults);

        this.printContainer = `<br><b>Print Output:</b><div id="print">${printResults}</div>`
        this.throttledUpdate();
    }

    public handleSpawnError(pythonCommand:string, pythonPath:string, err:string){
        let errMsg = `Error in the AREPL extension!\nWhile running python ${pythonCommand} ${pythonPath} we got ${err}`
        if (err.includes("ENOENT")) errMsg = errMsg + "\n\nAre you sure you have installed python 3 and it is in your PATH?"

        this.updateError(errMsg)
        this.throttledUpdate()
    }
}