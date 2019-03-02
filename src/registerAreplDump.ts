import { execSync } from "child_process";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import { isAbsolute, join, resolve, sep} from "path";


/**
 * registers arepl dump python file w/ python so it can be imported
 * @param pythonPath
 */
export function registerAreplDump(pythonPath: string, extensionDir: string){

    const sitePackagePath = getsitePackagePath(pythonPath)

    // i don't know why the heck site-packages folder would not exist
    // but it never hurts to be a little paranoid
    if(!existsSync(sitePackagePath)) mkDirByPathSync(sitePackagePath)

    writeFileSync(join(sitePackagePath, "areplDump.pth"), join(extensionDir, "node_modules", "arepl-backend", "python"))
}

/**
 * unregisters arepl dump python file from python
 */
export function unregisterAreplDump(pythonPath: string){
    const sitePackagePath = getsitePackagePath(pythonPath)

    unlinkSync(join(sitePackagePath, "areplDump.pth"))
}

function getsitePackagePath(pythonPath: string){
    // for some godforsaken reason it returns the path with a space at the end
    // hence the trim
    // pythonPath needs to be wrapped in quotes because path might have spaces
    return execSync(`"${pythonPath}" -m site --user-site`).toString().trim()
}

/**
 * node's inbuilt mkdirSync can't create multiple folders (wtf!).
 * So i got this func from stackoverflow: https://stackoverflow.com/questions/31645738/how-to-create-full-path-with-nodes-fs-mkdirsync
 */
function mkDirByPathSync(targetDir: string, { isRelativeToScript = false } = {}) {
    const initDir = isAbsolute(targetDir) ? sep : "";
    const baseDir = isRelativeToScript ? __dirname : ".";

    targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = resolve(baseDir, parentDir, childDir);
        if(curDir == '/') return '/' // to avoid EISDIR error on mac
        try {
          mkdirSync(curDir);
        } catch (err) {
          if (err.code === 'EEXIST') {
            return curDir;
          }
    
          const accOrPermErr = err.code ==='EACCES' || err.code === 'EPERM';
          if (!accOrPermErr || accOrPermErr && targetDir === curDir) {
            throw err;
          }
        }
    
        return curDir;
      }, initDir);
}