## AREPL: vscode edition [![Build Status](https://travis-ci.org/Almenon/AREPL-vscode.svg?branch=master)](https://travis-ci.org/Almenon/AREPL-vscode) [![Downloads](https://vsmarketplacebadge.apphb.com/installs/almenon.arepl.svg)](https://marketplace.visualstudio.com/items?itemName=almenon.arepl) [![Downloads](https://vsmarketplacebadge.apphb.com/rating-star/almenon.arepl.svg)](https://marketplace.visualstudio.com/items?itemName=almenon.arepl) [![Gitter chat](https://badges.gitter.im/arepl/gitter.png)](https://gitter.im/arepl/lobby)

AREPL automatically evaluates python code in real-time as you type

![Alt Text](https://raw.githubusercontent.com/Almenon/AREPL-vscode/master/areplDemoGif2.gif)

AREPL is availible for free on the vscode [marketplace](https://marketplace.visualstudio.com/items?itemName=almenon.arepl#overview)

## Usage

First, make sure you have [python 3.5 or greater](https://www.python.org/downloads/) installed.

Open a python file and right click on the editor title for AREPL launch options.

Or run AREPL through the command search: `control-shift-p`

or use the shortcuts: `control-shift-a` (current doc) / `control-shift-q` (new doc)

## Features

* Real-time evaluation: no need to run - AREPL evaluates your code automatically. You can control this (or even turn it off) in the settings

* Variable display: The final state of your local variables are displayed in a collapsible JSON format

* Error display: The instant you make a mistake an error with stack trace is shown

* Settings: AREPL offers many settings to fit your user experience.  Customize the look and feel, debounce time, python options, and more!

## Misc

### Dumping

If you want to dump local variables or dump variables at a specific point in your program you can use the dump function:

```python
from arepl_dump import dump

def milesToKilometers(miles):
    kilometers = miles*1.60934
    dump() # dumps all the vars in your function

    # or dump when function is called for a second time
    dump(None,1)

milesToKilometers(2*2)
milesToKilometers(3*3)

for char in ['a','b','c']:
    dump(char,2) # dump a var at a specific iteration

a=1
dump(a) # dump specific vars at any point in your program
a=2
```

### STDIN

see https://github.com/Almenon/AREPL-vscode/wiki/Using-AREPL-with-input

### GUIS

see https://github.com/Almenon/AREPL-vscode/wiki/Using-AREPL-with-GUI's

### #$save

If you want to avoid a section of code being executed in real-time (due to it being slow or calling external resources) you can use \#\$save.  For example:

```python
def largest_prime_factor(n):
    i = 2
    while i * i <= n:
        if n % i:
            i += 1
        else:
            n //= i
    return n

# this takes a looonnggg time to execute
result = largest_prime_factor(8008514751439999)

#$save
print("but now that i saved i am back to real-time execution")
```

```python
import random
x = random.random()
#$save
print(x) # this number will not change when editing below the #$save line
```

Please note that \#\$save [does not work](https://github.com/Almenon/AREPL-vscode/issues/53) with certain types, like generators.  If #$save fails in pickling the code state [file an issue](https://github.com/Almenon/AREPL-vscode/issues) so I can look into it.

Alternatively, you can use the [arepl_store variable](https://github.com/Almenon/AREPL-vscode/wiki/Caching-data-between-runs) to store data in between runs.

### #$end

Use the `#$end` comment to indicate the end of the real-time code. Code after `#$end` will not be executed in real-time.
This is useful if you have something specific you want to run without running the entire file along with it. For example:

```python
x = calculate_all_digits_of_pi()

#$end

# I can inspect variables without rerunning calculate_all_digits_of_pi
# the shortcut is control-enter - the code block should flash yellow.
print(x) # 3.14......

# I can also temporarily change the state of variables
# note that control-enter will run all adjacent lines of code
x = math.floor(x)
print(x) # 3

# i only want to do this once I've determined that x is correct
upload_results_to_s3(x)
```

Note that you can also use control-enter to run a block of code outside `#$end`.

### Filtering variables from display

Don't want to see a variable in AREPL's result panel?
Just add it to a variable named `arepl_filter`:

```python
arepl_filter = ['a']
a = "foo" # this won't show up
b = 3 # this does
```

You can also filter out types:

```python
arepl_filter_type=["<class 'str'>"]
c = "foo" # this won't show up
c = 3 # this does
```

Finally there is a super-powerful arepl_filter_function var you can use to totally customize what is shown:

```python
from collections import namedtuple

Point = namedtuple('Point', ['x', 'y'])
p = Point(x=1, y=1)

def arepl_filter_function(var_dict):
    var_dict['p']=var_dict['p'].x + var_dict['p'].y
    return var_dict

# p will show up as 2
```

You can set default filters via the `defaultFilterVars` or `defaultFilterTypes` settings.

### HOWDOI

You can use [howdoi](https://github.com/gleitz/howdoi) with arepl.

First install in the terminal / command line:

> pip install howdoi

Then reopen arepl and you will be able to use howdoi to get answers to your questions. For example:

```python
howdoi('calculate fibbonaci in python')
```

 will give you a function to calcualate a fibonaci number

### Variable Representation

I have [overridden the display](https://github.com/Almenon/AREPL-backend/blob/master/python/customHandlers.py) of some types (like datetime) to be more readable to humans.

If you want a type to be displayed in a particular manner just [file an issue](https://github.com/Almenon/AREPL-vscode/issues)

### More Stuff

Check out the [wiki](https://github.com/Almenon/AREPL-vscode/wiki)!

#### Contributing to the project

See the [wiki page](https://github.com/Almenon/AREPL-vscode/wiki/Getting-Started-for-contributors-to-AREPL) on getting started. Contributions welcome!
