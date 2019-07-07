from arepl_dump import dump
import sys

def foo():
    x = 1
    dump("y")
    dump(x)
    dump()

foo()
a=1
dump(a)
a=2
dump()
a = 3
raise Exception 

"""
-{
    line 6: "y",
    line 7: 1,
    foo vars line 8: -{
        x: 1
    },
    line 12: 1,
    <module> vars line 14: -{
        a: 2
    },
    a: 3
}
6 ms
""" 
