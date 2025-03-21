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

    public static async getPythonPath(resource: vscode.Uri = null): Promise<string> {
        // see bottom of file for license
        // adapted from vscode-restructuredtext/vscode-restructuredtext#224
        const extension = vscode.extensions.getExtension('ms-python.python')
        if (!extension) {
            const pythonPath = settings().get<string>('pythonPath')
            return pythonPath ? pythonPath : PythonShell.defaultPythonPath
        }
        const usingNewInterpreterStorage = extension.packageJSON?.featureFlags?.usingNewInterpreterStorage
        if (usingNewInterpreterStorage) {
            if (!extension.isActive) {
                await extension.activate()
            }
            const pythonPath = extension.exports.settings.getExecutionDetails(resource).execCommand
            if(!pythonPath){
                const pythonPath = settings().get<string>('pythonPath')
                return pythonPath ? pythonPath : PythonShell.defaultPythonPath
            }
            return pythonPath[0]; // might be more elements if conda, but we are not bothering to support that yet
        } else {
            let pythonPath = vscodeUtils.getSettingOrOtherExtSettingAsDefault<string>("AREPL", "python", "pythonPath")
            if(!pythonPath) pythonPath = PythonShell.defaultPythonPath
            return vscodeUtils.expandPathSetting(pythonPath)
        }
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

/**
 * getPythonPath falls under the below License:
reStructuredText for Visual Studio Code
Copyright (c) Lex Li

All rights reserved. 

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the ""Software""), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */