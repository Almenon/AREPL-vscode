"use strict"
import * as vscode from "vscode";
import {EOL} from "os"
import {settings} from "./settings"
import { PythonShell } from "python-shell";
import vscodeUtils from "./vscodeUtilities"

/**
 * utilities specific to AREPL
 */
export default class areplUtils {

    static getEnvFilePath(){
        let envFilePath = vscodeUtils.getSettingOrOtherExtSettingAsDefault<string>("AREPL", "python", "envFile")

        if(!envFilePath) envFilePath = "${workspaceFolder}/.env"

        return vscodeUtils.expandPathSetting(envFilePath)
    }

    static getPythonPath(){
        let pythonPath = vscodeUtils.getSettingOrOtherExtSettingAsDefault<string>("AREPL", "python", "pythonPath")

        if(!pythonPath) pythonPath = PythonShell.defaultPythonPath

        return vscodeUtils.expandPathSetting(pythonPath)
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