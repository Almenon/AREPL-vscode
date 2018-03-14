## AREPL: vscode edition [![Build Status](https://travis-ci.org/Almenon/AREPL-vscode.svg?branch=master)](https://travis-ci.org/Almenon/AREPL-vscode) [![Downloads](https://vsmarketplacebadge.apphb.com/installs/almenon.arepl.svg)](https://marketplace.visualstudio.com/items?itemName=almenon.arepl) [![Gitter chat](https://badges.gitter.im/arepl/gitter.png)](https://gitter.im/arepl/lobby)

AREPL automatically evaluates python code in real-time as you type

![Alt Text](https://raw.githubusercontent.com/Almenon/AREPL-vscode/master/example.gif)

AREPL is availible from the vscode [marketplace](https://marketplace.visualstudio.com/items?itemName=almenon.arepl#overview) or as a [standalone app](https://github.com/Almenon/AREPL)

### Useage

First, make sure you have [python 3](https://www.python.org/downloads/) installed.

Open a python file and run AREPL through the command search

>     control-shift-p

or use a shortcut: control-shift-a / command-shift-a

#### Features

* Real-time evaluation: no need to run - AREPL evaluates your code automatically. You can control this (or even turn it off) in the settings

* Variable display: The final state of your local variables are displayed in a collapsible JSON format

* Error display: The instant you make a mistake an error with stack trace is shown

* Settings: AREPL offers many settings to fit your user experience.  Customize the look and feel, debounce time, python options, and more!

#### Misc

Using AREPL with venv: set the AREPL.pythonPath setting to reference the location of your venv python

Linux is not supported yet but support should be coming soon :)

#### Deveveloper Setup

1. Install VSCode, python 3 and npm (if not already installed)
2. clone this repository
3. npm install
4. start debugging

see [AREPL-backend](https://github.com/Almenon/AREPL-backend) for the npm package that executes the python code