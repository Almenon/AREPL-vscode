import {workspace} from "vscode"

/**
 * simple alias for workspace.getConfiguration("AREPL")
 */
export function settings(){
    return workspace.getConfiguration("AREPL")
}