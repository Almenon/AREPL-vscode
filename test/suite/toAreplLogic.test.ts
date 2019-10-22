import * as assert from "assert";
import * as vscode from "vscode";
import {ToAREPLLogic} from '../../src/toAREPLLogic'
import Reporter from "../../src/telemetry";
import vscodeUtils from "../../src/vscodeUtilities";
import {settings} from "../../src/settings"
import { EOL } from "os";


/**
 * this suite tests both previewContainer and pythonPanelPreview
 * by activating funcs in previewContainer and looking at html rendered by pythonPanelPreview
 */
suite("PreviewContainer and pythonPanelPreview Tests", () => {

    const arepl = vscode.extensions.getExtension("almenon.arepl")!;

    const mockPythonEvaluator: any = {
        execCode: ()=>{}
    }

    const toAREPLLogic = new ToAREPLLogic(mockPythonEvaluator, null);

    test("arepl not ran when just end section is changed", function(){
        let returnVal = toAREPLLogic.onUserInput(`#$end${EOL}bla`, "", EOL)
        assert.equal(returnVal, true)
        returnVal = toAREPLLogic.onUserInput(`#$end${EOL}foo`, "", EOL)
        assert.equal(returnVal, false)
    });

    test("unsafe keyword not allowed", function(){
        assert.equal(toAREPLLogic.scanForUnsafeKeywords("  os.rmdir('bla')", ["rmdir"]), true)
    });

    test("safe keyword allowed", function(){
        assert.equal(toAREPLLogic.scanForUnsafeKeywords("bla bla bla", ["rmdir"]), false)
    });

    test("unsafe keyword allowed in comment", function(){
        assert.equal(toAREPLLogic.scanForUnsafeKeywords("#rmdir", ["rmdir"]), false)
    });

    test("unsafe keywords not allowed", function(){
        assert.equal(toAREPLLogic.scanForUnsafeKeywords("DELETE * FROM", ["rmdir","DELETE"]), true)
    });


});