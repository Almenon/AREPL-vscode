import * as vscode from "vscode"

export default function pythonGuiLibraryIsPresent(code: string){

    const settings = vscode.workspace.getConfiguration("AREPL")
    let pyGuiLibraries = settings.get<string[]>("pyGuiLibraries")
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