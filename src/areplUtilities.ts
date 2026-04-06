"use strict"
import * as vscode from "vscode";
import {EOL} from "os"
import {settings} from "./settings"
import { PythonShell } from "python-shell";
import vscodeUtils from "./vscodeUtilities"

import { PythonExtension } from '@vscode/python-extension';
import { existsSync, lstatSync } from "fs";

/**
 * utilities specific to AREPL
 */
export default class areplUtils {

    static getEnvFilePath(){
        let envFilePath = vscodeUtils.getSettingOrOtherExtSettingAsDefault<string>("AREPL", "python", "envFile")

        if(!envFilePath) envFilePath = "${workspaceFolder}/.env"

        return vscodeUtils.expandPathSetting(envFilePath)
    }

    public static async getPythonPath(): Promise<string> {
        const pythonApi: PythonExtension = await PythonExtension.api();
        const environments = pythonApi.environments;
        const environmentPath = environments.getActiveEnvironmentPath();
        console.log(`Python extension path: ${environmentPath?.path}`)

        if (!environmentPath?.path) {
            console.log("Path from python extension is falsey")
        } else if (!existsSync(environmentPath.path)) {
            console.log("Path from python extension does not exist")
        } else if (!lstatSync(environmentPath.path).isFile()) {
            console.log("Path from python extension is not a file")
        } else {
            return environmentPath.path;
        }

        console.log("Falling back to AREPL's pythonPath setting")
        const pythonPath = settings().get<string>('pythonPath')
        return pythonPath ? pythonPath : PythonShell.defaultPythonPath
    }

    static insertDefaultImports(editor: vscode.TextEditor){
        return editor.edit((editBuilder) => {
            let imports = settings().get<string[]>("defaultImports")

            imports = imports.filter(i => i.trim() != "")
            if(imports.length == 0) return

            imports = imports.map(i => {
                const words = i.split(" ")

                // python import syntax: "import library" or "from library import method"
                // so if user didnt specify import we will do that for them :)
                if(words[0] != "import" && words[0] != "from" && words[0].length > 0){
                    i = "import " + i
                }

                return i
            })

            editBuilder.insert(new vscode.Position(0, 0), imports.join(EOL) + EOL)
        })
    }

}
