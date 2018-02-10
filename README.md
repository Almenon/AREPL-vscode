## AREPL: vscode edition

AREPL automatically evaluates python code in real-time as you type

![Alt Text](https://raw.githubusercontent.com/Almenon/AREPL-vscode/master/example.gif)

Not availible on appstore yet but you can download alpha version manually from [releases](https://github.com/Almenon/AREPL-vscode/releases).  I would love to hear any feedback, good or bad.

Once you download it the command to activate is "AREPL: eval python in real time"

In windows you can access the command search by using control-shift-p

You can activate AREPL directly by using control-shift-a or command-shift-a if on Mac

#### Deveveloper Setup:

1. Install VSCode, python 3 and npm (if not already installed)
2. clone this repository
3. npm install
4. start debugging

see [AREPL-backend](https://github.com/Almenon/AREPL-backend) for the npm package that executes the python code

AREPL is also availible as a standalone [app](https://github.com/Almenon/AREPL)

### Settings:

AREPL offers the following customizable settings:

// delay in ms before executing code after typing
> "AREPL.delay": 300,

// 70 fits in 1280 screen
> "AREPL.max_string_length": 70,

// when restart mode is active we add this to delay to delay longer
> "AREPL.restartDelay": 300,

// 2 shows x=1 and x=[1,2], provides option to expand deeply nested data like x=[[1]]
> "AREPL.show_to_level": 2