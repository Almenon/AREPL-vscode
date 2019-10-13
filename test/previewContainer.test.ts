import * as assert from "assert";
import {PreviewContainer} from "../src/previewContainer"
import Reporter from "../src/telemetry";
import { PythonResult } from "arepl-backend";


/**
 * this suite tests both previewContainer with mocked pythonPreview
 */
suite("PreviewContainer and pythonPreview Tests", () => {

    let mockUserError:any
    let mockResult:PythonResult
    let reporter:Reporter

    let previewContainer:PreviewContainer;

    const mockContext: any = {
        asAbsolutePath: (file: string)=>{
            return __dirname + "/" + file
        },
        extensionPath: "",
    }

    setup(function(){
        reporter = new Reporter(false)
        previewContainer = new PreviewContainer(new Reporter(false), mockContext, 0);
        // we don't want to actually use vscode so we skip calling start which creates the panel
        // so instead we have to mock the panel
        previewContainer['pythonPanelPreview']['panel'] = {
            //@ts-ignore
            'webview':{
                'html':""
            }
        }
        
        mockUserError = {
            "__cause__": {},
            "__context__": {},
            "__suppress_context__": false,
            "_str": "",
            "exc_traceback": {},
            "exc_type": {},
            "stack": {}
        }
        mockResult = {
            caller: "",
            done: true,
            execTime: 0,
            internalError: "",
            lineno: -1,
            totalPyTime: 0,
            totalTime: 0,
            userError: mockUserError,
            userErrorMsg: `Traceback (most recent call last):
    line 1, in <module>
    NameError: name 'x' is not defined`,
            userVariables: {},
        }
    })

    test("times are logged", function(){
        mockResult.execTime = 1
        mockResult.totalPyTime = 2
        mockResult.totalTime = 3
        previewContainer.handleResult(mockResult)
        assert.equal(reporter.execTime, 1)
        assert.equal(reporter.totalPyTime, 2)
        assert.equal(reporter.totalTime, 3)
    });

    test("internal error overrides regular", function(){
        let error:string
        previewContainer['pythonPanelPreview']['updateError'] = (e)=>{
            error = e
        }
        mockResult.internalError = "this should override"
        previewContainer.handleResult(mockResult)
        assert.equal(error, "this should override")
    });

    test("vars skipped if syntax error", function(){
        let called = false
        previewContainer['pythonPanelPreview']['updateError'] = ()=>{
            called = true
        }
        mockResult.userError.msg = "syntax error"
        previewContainer.handleResult(mockResult)
        assert.equal(called, false)
    });

});