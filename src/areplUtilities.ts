"use strict"
import * as vscode from "vscode";
import {EOL} from "os"
import {settings} from "./settings"
import { PythonShell } from "python-shell";
import vscodeUtils from "./vscodeUtilities"

import { PythonExtension } from '@vscode/python-extension';
import { PythonEnvironments, PythonEnvironmentApi } from '@vscode/python-environments';

/**
 * utilities specific to AREPL
 */
export default class areplUtils {

    static getEnvFilePath(){
        let envFilePath = vscodeUtils.getSettingOrOtherExtSettingAsDefault<string>("AREPL", "python", "envFile")

        if(!envFilePath) envFilePath = "${workspaceFolder}/.env"

        return vscodeUtils.expandPathSetting(envFilePath)
    }

    private static async tryGetPythonPathFromEnvironmentsAPI(): Promise<string | undefined> {
        let envsApi = null
        try {
            // error will be thrown if ext not installed
            envsApi = await PythonEnvironments.api();
        } catch {
            return undefined;
        }

        const environment = await envsApi.getEnvironment(undefined);
        return environment ? environment.execInfo.run.executable : undefined;
    }

    private static async tryGetPythonPathFromPythonAPI(): Promise<string | undefined> {
        let pythonApi = null
        try {
            // error will be thrown if ext not installed
            pythonApi = await PythonExtension.api();
        } catch {
            return undefined;
        }
        const environments = pythonApi.environments;
        const environmentPath = environments.getActiveEnvironmentPath();
        return environmentPath?.path
    }

    public static async getPythonPath(): Promise<string> {
        console.log("Trying to find python path")
        console.log("Tier 1: Try Python Environments API (newer, preferred)")
        let pythonPath = await this.tryGetPythonPathFromEnvironmentsAPI();
        if (pythonPath) {
            return pythonPath;
        }

        console.log("Tier 2: Try Python Extension API (legacy)")
        pythonPath = await this.tryGetPythonPathFromPythonAPI();
        if (pythonPath) {
            return pythonPath;
        }

        console.log("Tier 3: AREPL's pythonPath setting")
        pythonPath = settings().get<string>('pythonPath');
        if (pythonPath) {
            return pythonPath;
        }

        console.log("Tier 4: System default")
        return PythonShell.defaultPythonPath;
    }

    static insertDefaultImports(editor: vscode.TextEditor){
        return editor.edit((editBuilder) => {
            let imports = settings().get<string[]>("defaultImports")
            if (!imports) return

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
