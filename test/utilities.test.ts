//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
import * as assert from "assert";
import Utilities from '../src/utilities'

suite("Utility Tests", () => {

    suite('isEmpty', () => {
        test("returns true for empty element", function(){
            assert.strictEqual(Utilities.isEmpty({}), true)
            assert.strictEqual(Utilities.isEmpty([]), true)
        });
    
        test("returns false for non-empty elements", function(){
            assert.strictEqual(Utilities.isEmpty({a:null}), false)
            assert.strictEqual(Utilities.isEmpty([1]), false)
        }); 
    });

    suite('escape html', () => {

        test("escapes html", function(){
            assert.strictEqual(Utilities.escapeHtml("<yo>"), "&lt;yo&gt;")
        });
    
        test("does not escape non-html", function(){
            assert.strictEqual(Utilities.escapeHtml("feaf$"), "feaf$")
        });
        
    });
    
});