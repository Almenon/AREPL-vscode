//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
import * as assert from "assert";
import Utilities from '../../src/utilities'

suite("Utility Tests", () => {

    test("isEmpty returns true for empty element", function(){
        assert.equal(Utilities.isEmpty({}), true)
        assert.equal(Utilities.isEmpty([]), true)
    });

    test("isEmpty returns false for non-empty elements", function(){
        assert.equal(Utilities.isEmpty({a:null}), false)
        assert.equal(Utilities.isEmpty([1]), false)
    });

    test("escape html escapes html", function(){
        assert.equal(Utilities.escapeHtml("<yo>"), "&lt;yo&gt;")
    });

    test("escape html does not escape non-html", function(){
        assert.equal(Utilities.escapeHtml("feaf$"), "feaf$")
    });

});