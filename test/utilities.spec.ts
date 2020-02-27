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

        test("returns true for null element", function(){
            assert.strictEqual(Utilities.isEmpty(null), true)
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

    suite('get last line', () => {
        test("gets last line", function(){
            assert.strictEqual(Utilities.getLastLine("a\nb"), "b")
        })

        test("does not error when empty", function(){
            assert.strictEqual(Utilities.getLastLine(""), "")
        })
    });

    suite('flatten nested object', () => {
        test("does not error out on null objects", function(){
            assert.deepStrictEqual(Utilities.flattenNestedObject(null, "key"), [])
        })

        test("does not error with bad key", function(){
            assert.deepStrictEqual(Utilities.flattenNestedObject({}, "b"), [{}])
        })

        test("can flatten a single object", function(){
            assert.deepStrictEqual(Utilities.flattenNestedObject({'a':null}, "a"), [{'a':null}])
        })

        test("can flatten nested objects", function(){
            assert.deepStrictEqual(
                Utilities.flattenNestedObject({'a':{'a':null}}, "a"), [{'a':{'a':null}}, {'a':null}]
            )
        })
    });
    
    suite('flatten nested object with multiple keys', () => {
        test("can flatten nested objects", function(){
            assert.deepStrictEqual(
                Utilities.flattenNestedObjectWithMultipleKeys({'a':{'a':null}}, ["a", "b"]), [{'a':{'a':null}}, {'a':null}]
            )

            assert.deepStrictEqual(
                Utilities.flattenNestedObjectWithMultipleKeys({'a':{'b':null}}, ["a", "b"]), [{'a':{'b':null}}, {'b':null}]
            )
        })
    });

});