###########################################
#                Code
###########################################

def foo():
    raise Exception
    
def foo2():
    try:
        foo()
    except Exception as e:
        fah

try:
    foo2()
except Exception as e:
    fah
 
 
###########################################
#                Expected Result
###########################################

"""
Traceback (most recent call last):
  line 6, in foo2
  line 2, in foo
Exception

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  line 11, in <module>
  line 8, in foo2
NameError: name 'fah' is not defined

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  line 13, in <module>
NameError: name 'fah' is not defined

"""