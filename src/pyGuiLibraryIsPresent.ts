let pyGuiLibraries = ["turtle", "matplotlib", "tkinter", "kivy", "pyforms", "PyQt4", "PyQt5", "wx", "pyside", "plotly", "ggplot", "bokeh"]
// of course there are tons more GUI and plotting libraries but that should cover most
// edge case: pandas may or may not be used for graphing
let pyGuiLibrariesImport = new RegExp("^import (" + pyGuiLibraries.join('|') + ')', 'im')
let pyGuiLibrariesFromImport = new RegExp("^from (" + pyGuiLibraries.join('|') + ')', 'im')

export default function pythonGuiLibraryIsPresent(code:string){
	if(code.match(pyGuiLibrariesImport) || code.match(pyGuiLibrariesFromImport)){
		return true
	}
	else return false
}