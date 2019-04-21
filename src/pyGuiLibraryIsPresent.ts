import * as vscode from "vscode"
import {settings} from "./settings"

export default function pythonGuiLibraryIsPresent(code: string){
    let pyGuiLibraries = settings().get<string[]>("pyGuiLibraries")
    pyGuiLibraries = pyGuiLibraries.filter(library => library.trim() != "")
    if(pyGuiLibraries.length == 0){
        return false
    }

    const pyGuiLibrariesImport = new RegExp("^import (" + pyGuiLibraries.join("|") + ")", "im")
    const pyGuiLibrariesFromImport = new RegExp("^from (" + pyGuiLibraries.join("|") + ")", "im")

    if(code.match(pyGuiLibrariesImport) || code.match(pyGuiLibrariesFromImport)){
      return true
    }
    else return false
}