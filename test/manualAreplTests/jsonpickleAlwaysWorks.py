class foo:
    def __getstate__(self):
        a
f = foo()

class foo2:
    def __getstate__(self):
        return "custom display"
g = foo2()

good = "good"


""" EXPECTED RESULT
-{
    f: "AREPL could not pickle this object",
    foo: -{
        py/type: "__main__.foo"
    },
    foo2: -{
        py/type: "__main__.foo2"
    },
    g: -{
        py/object: "__main__.foo2",
        py/state: "custom display"
    },
    good: "good"
}
0 ms
"""