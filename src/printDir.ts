// todo: extract this logic out to python code
// trying to parse python syntax with regex is BAD IDEA
// and will ineveitably fail in certain scenarios

/**
 * line -> func(line)
 */
function wrapLineWithFunc(line: string, func: string|string[]){
	if(typeof func == "string" || func.length == 1) return func + '(' + line + ')'
	else return wrapLineWithFunc(func[func.length-1] + '(' + line + ')', func.slice(0,func.length-1))
}

/**
 * prints conditional by saving it to a var and adding a print(var)
 * if(1+1==2) -> temporaryVar = 1+1==2; print(temporaryVar); if(temporaryVar):
 * @param line if conditional
 */
function ifPrint(line: string){
    let tabs = /^\s*/.exec(line)[0]
    let conditional = line.replace(/^\s*if\(?/, '').replace(/\)?:\s*$/, '')

    // avoid name collision with user variables
    let randomId = Math.floor(Math.random()*1000000)
    let tempVar = "temporaryVar" + randomId

    return `${tabs}${tempVar} = ${conditional}; print(${tempVar}); if(${tempVar}):`
}

/**
 * adds print() or print(dir()) if line ends in .
 * ex: x=1; print(x)
 */
export default function printDir(codeLines: string[], currentLineNum: number){

	let currentLine = codeLines[currentLineNum]
	let newLine = ""
	let variableEquals = /(^[^=]+)=[^=]/
	let intellisense = false
	
	if(currentLine.endsWith('.')){
		intellisense = true
		currentLine = currentLine.slice(0,-1) //get rid of . to avoid syntax err
    }
    
    if(!intellisense && /^\s*if[ (]/.exec(currentLine) && /\s*$/.exec(currentLine)){
        codeLines[currentLineNum] = ifPrint(currentLine)
        return codeLines
    }

	let equalMatches = variableEquals.exec(currentLine)
	if (equalMatches != null){
		newLine = equalMatches[1] // first capture group: "x" in "x=1"
	} else { newLine = currentLine }

	
	if(intellisense){
		newLine = wrapLineWithFunc(newLine, ["print", "dir"])
	}
	else{
		newLine = wrapLineWithFunc(newLine, "print")
	}

	codeLines[currentLineNum] = currentLine+'; '+newLine
	
	return codeLines
}