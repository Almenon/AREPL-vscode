import { Buffer } from "buffer";
import { extensions, WorkspaceConfiguration } from "vscode";
import TelemetryReporter from "vscode-extension-telemetry";
import { userInfo } from "os";
import { sep } from "path";

export default class Reporter{
    private reporter: TelemetryReporter
    private timeOpened: number
    private lastStackTrace: string
    numRuns: number
    numInterruptedRuns: number
    execTime: number
    totalPyTime: number
    totalTime: number

    constructor(private enabled: boolean){
        const extensionId = "almenon.arepl";
        const extension = extensions.getExtension(extensionId)!;
        const extensionVersion = extension.packageJSON.version;

        // following key just allows you to send events to azure insights API
        // so it does not need to be protected
        // but obfuscating anyways - bots scan github for keys, but if you want my key you better work for it, damnit!
        const innocentKitten = Buffer.from("NWYzMWNjNDgtNTA2OC00OGY4LWFjMWMtZDRkY2Y3ZWFhMTM1", "base64").toString()
    
        this.reporter = new TelemetryReporter(extensionId, extensionVersion, innocentKitten);
        this.resetMeasurements()
    }

    sendError(name: string, stackTrace: string, code: number = 0, category='typescript'){
        if(this.enabled){
            // no point in sending same error twice (and we want to stay under free API limit)
            if(stackTrace == this.lastStackTrace) return

            stackTrace = this.anonymizePaths(stackTrace)

            this.reporter.sendTelemetryEvent("error", {
                code: code.toString(),
                name,
                stackTrace,
                category,
            })

            this.lastStackTrace = stackTrace
        }
    }

    /**
     * we want to collect data on how long the user uses the extension
     * and the settings they use
     */
    sendFinishedEvent(settings: WorkspaceConfiguration){
        if(this.enabled){
            const measurements: {[key:string]: number} = {}
            measurements['timeSpent'] = (Date.now() - this.timeOpened)/1000
            measurements['numRuns'] = this.numRuns
            measurements['numInterruptedRuns'] = this.numInterruptedRuns
            measurements['execTime'] = this.execTime / this.numRuns
            measurements['totalPyTime'] = this.totalPyTime / this.numRuns
            measurements['totalTime'] = this.totalTime / this.numRuns

            const properties: {[key: string]: string} = {}

            // no idea why I did this but i think there was a reason?
            // this is why you leave comments people
            const settingsDict = JSON.parse(JSON.stringify(settings))            
            for(let key in settingsDict){
                properties[key] = settingsDict[key]
            }
            
            properties['pythonPath'] = this.anonymizePaths(properties['pythonPath'])

            this.reporter.sendTelemetryEvent("closed", properties)

            this.resetMeasurements()
        }
    }

    private resetMeasurements(){
        this.timeOpened = Date.now()

        this.numRuns = 0
        this.numInterruptedRuns = 0
        this.execTime = 0
        this.totalPyTime = 0
        this.totalTime = 0
    }

    /**
     * replace username with anon
     */
    anonymizePaths(input:string){
        if(input == null) return input
        return input.replace(new RegExp('\\'+sep+userInfo().username, 'g'), sep+'anon')
    }

    dispose(){this.reporter.dispose()}
}
