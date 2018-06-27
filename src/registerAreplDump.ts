import { writeFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

/**
 * registers arepl dump python file w/ python so it can be imported
 */
export function registerAreplDump(pythonPath:string, extensionDir:string){
    let sitePackagePath = getsitePackagePath(pythonPath)

    // i don't know why the heck site-packages folder would not exist
    // but it never hurts to be a little paranoid
    if(!existsSync(sitePackagePath)) mkdirSync(sitePackagePath)

    writeFileSync(join(sitePackagePath, "areplDump.pth"), join(extensionDir, 'node_modules', 'arepl-backend', 'python'))
}

/**
 * unregisters arepl dump python file from python
 */
export function unregisterAreplDump(pythonPath:string){
    let sitePackagePath = getsitePackagePath(pythonPath)

    unlinkSync(join(sitePackagePath, "areplDump.pth"))
}

function getsitePackagePath(pythonPath:string){
    return execSync(pythonPath + " -m site --user-site").toString()
}