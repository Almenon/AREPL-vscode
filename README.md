## AREPL: vscode edition [![Build Status](https://travis-ci.org/Almenon/AREPL-vscode.svg?branch=master)](https://travis-ci.org/Almenon/AREPL-vscode)

AREPL automatically evaluates python code in real-time as you type

![Alt Text](https://raw.githubusercontent.com/Almenon/AREPL-vscode/master/example.gif)

AREPL is availible from the vscode [marketplace](https://marketplace.visualstudio.com/items?itemName=almenon.arepl#overview) or as a [standalone app](https://github.com/Almenon/AREPL)

### Useage

First, make sure you have [python 3](https://www.python.org/downloads/) installed.

Open a python file and run AREPL through the command search

>     control-shift-p

or use a shortcut: control-shift-a / command-shift-a

#### Settings:

AREPL offers the following customizable settings:

> "AREPL.delay": 300,

delay in milliseconds before executing code after typing

> "AREPL.max_string_length": 70,

strings over X characters are truncated with an option to expand

> "AREPL.restartDelay": 300,

extra delay when programming with a GUI (like turtle).  Added onto delay.

> "AREPL.show_to_level": 2

2 shows x=1 and x=[1,2], provides option to expand deeply nested data like x=[[1]]

#### Deveveloper Setup:

1. Install VSCode, python 3 and npm (if not already installed)
2. clone this repository
3. npm install
4. start debugging

see [AREPL-backend](https://github.com/Almenon/AREPL-backend) for the npm package that executes the python code
