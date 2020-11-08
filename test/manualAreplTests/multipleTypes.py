###########################################
#                Code
###########################################

import math # doesn't show up (good, we dont want modules to show)
a = 1
b = 1.1
c = float('nan')
d = float('infinity')
e = float('-infinity')
f = 'é' #doesnt render properly :(
g = {}
h = [] 
i = [[[]]]
j = lambda x: x+1 # doesnt show up???
def k(x):
	return x+1
class l():
	def __init__(self,x):
		self.x = x
m = l(5)
n = False
with open(__file__) as f:
  o = f

###########################################
#                Expected Result
###########################################
"""
-{
    a: 1,
    b: 1.1,
    c: "NaN",
    d: "Infinity",
    e: "-Infinity",
    f: "Ã©",
    g: {},
    h: [],
    i: -[
       +[1 items]
    ],
    l: -{
        py/type: "__main__.l"
    },
    m: -{
        py/object: "__main__.l",
        x: 5
    },
    n: false,
    o: -{
        py/id: 0
    }
}

we should see lambda too but we havn't implemented that yet
"""
