import { Buffer } from 'buffer';
import { extensions, workspace, WorkspaceConfiguration } from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';

export default class Reporter{
    private reporter: TelemetryReporter
    private timeSpent: number
    private lastException: string
    private lastErrorCode: number

    constructor(private enabled:boolean){
        const extensionId = 'almenon.arepl';
        const extension = extensions.getExtension(extensionId)!;
        const extensionVersion = extension.packageJSON.version;

        // following key just allows you to send events to azure insights API
        // so it does not need to be protected
        // but obfuscating anyways - bots scan github for keys, but if you want my key you better work for it, damnit!
        const innocentKitten = Buffer.from('NWYzMWNjNDgtNTA2OC00OGY4LWFjMWMtZDRkY2Y3ZWFhMTM1','base64').toString()
    
        this.reporter = new TelemetryReporter(extensionId, extensionVersion, innocentKitten);
        this.timeSpent = Date.now()
    }

    sendError(exception:string, code:number=0){
        if(this.enabled){
            // no point in sending same error twice (and we want to stay under free API limit)
            if(exception == this.lastException && code == this.lastErrorCode) return

            this.reporter.sendTelemetryEvent('error', {
                'code': code.toString(),
                'exception': exception
            })

            this.lastErrorCode = code
            this.lastException = exception
        }
    }

    /**
     * we want to collect data on how long the user uses the extension
     * also pythonPath to see if they are using python2 / 3 / virtual env python
     */
    sendFinishedEvent(settings:WorkspaceConfiguration){
        if(this.enabled){
            let properties: {[key: string]: string} = {}

            this.timeSpent = Date.now()-this.timeSpent
            properties['timeSpent'] = this.timeSpent.toString()

            let settingsDict = JSON.parse(JSON.stringify(settings))
            for(let key in settingsDict){
                properties[key] = settingsDict[key]
            }

            this.reporter.sendTelemetryEvent('closed', properties)
        }
    }

    dispose(){this.reporter.dispose()}
}