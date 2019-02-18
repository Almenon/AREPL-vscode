class foo:
    def __getstate__(self):
        a
f = foo()

class foo2:
    def __getstate__(self):
        return "custom display"
g = foo2()

good = "good"

