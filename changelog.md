## [v1.0.4](https://github.com/Almenon/AREPL-vscode/milestone/23?closed=1) (12/29/2018)
🚀 input() support! Hardcode input like so: standard_input = "hello\\nworld" to be able to use input()
🔧 inline errors icons are now turned on by default - you can turn them off in settings
🔧 AREPL on windows now uses py (C:\\Windows\\py.exe) to launch python
🐛 Fixed bug where inline error icons stayed present when closing arepl
🐛 Fixed bug where items kept on being added to sys.path between runs

## [v1.0.4](https://github.com/Almenon/AREPL-vscode/milestone/22?closed=1) (12/15/2018)
pythonPath setting now supports paths relative to the workspace

Added optional inline error icons - this can be turned on by setting inlineResults setting to true

[howdoi](https://github.com/gleitz/howdoi) integration - install howdoi with pip to be able to call howdoi from arepl. For example
<code>howdoi('calculate fibbonaci in python')</code> will give you a function to calcualate a fibonaci number

## v1.0.3
${workspaceFolder} can now be used in pythonPath for pointing to workspace-specific python interpreters

jsonPickle version upgrade w/ slightly better numpy and pandas support

Fixed bug with linux

## v1.0.2
Fixed error with using gui

## v1.0.1
Fixed error on mac due to a filename having the wrong case when packaging extension

## [v1.0.0](https://github.com/Almenon/AREPL-vscode/milestone/16?closed=1)

Fixed:
#86 unittest causes arepl to fail silently bug
#101 styling becomes wierd when in certain scenarios bug 
#102  internal error does not show bug
#94  arepl frequently has problems rendering when there is a lot of prints bug

Updated:
#56  use new webview enhancement
#52 Update vscode-extension-telemetry to the latest version 🚀  greenkeeper

## [v1.5](https://github.com/Almenon/AREPL-vscode/milestone/15?closed=1)

fixed #84 #87 #98

AREPL now works with python 3.7

AREPL now shows stderr (logs, for example) in print output

AREPL will no longer fail silently when help or input is called

## [v1.4](https://github.com/Almenon/AREPL-vscode/milestone/14?closed=1)

### Fixed:
dump output does not appear if exception [#91](https://github.com/Almenon/AREPL-vscode/issues/91)

arepl does not update when user changes a imported file [#82](https://github.com/Almenon/AREPL-vscode/issues/82)

Functions no longer appear in variable preview (not much point in showing them and they clutter screen)

## [v1.3](https://github.com/Almenon/AREPL-vscode/milestone/13?closed=1)

### Fixed:
arepl would not start if user had no python user packages installed  https://github.com/Almenon/AREPL-vscode/issues/81

### Added:
ability to execute on keybinding  https://github.com/Almenon/AREPL-vscode/issues/85

## [v1.2](https://github.com/Almenon/AREPL-vscode/milestone/12?closed=1)

### Added:
Ability to dump local variables and variables at specific points in your program - https://github.com/Almenon/AREPL-vscode/issues/74
Click on errors to google them - https://github.com/Almenon/AREPL-vscode/issues/76

## [v1.1](https://github.com/Almenon/AREPL-vscode/milestone/11?closed=1)

### Added:
GUI library setting - https://github.com/Almenon/AREPL-vscode/issues/68
default imports - https://github.com/Almenon/AREPL-vscode/issues/67

### Fixed:
display of strings - see https://github.com/Almenon/AREPL-vscode/issues/71


## [v1.0](https://github.com/Almenon/AREPL-vscode/milestone/10?closed=1)

### Added:
Changelog in landing page (see [#58](https://github.com/Almenon/AREPL-vscode/issues/58))

Better landing page with examples (see [#32](https://github.com/Almenon/AREPL-vscode/issues/32))

Better display of variables (see [#63](https://github.com/Almenon/AREPL-vscode/issues/63))

### Fixed:
Relative imports not working (see [#69](https://github.com/Almenon/AREPL-vscode/issues/69))

---

## [v9](https://github.com/Almenon/AREPL-vscode/milestone/9?closed=1)

### Added:
Added telemetry (see [#50](https://github.com/Almenon/AREPL-vscode/issues/51)).
This is optional and can be turned off in the settings.

Having this turned on helps me analyze how many users I have, what settings are useful to them, and how frequently they use AREPL. It also reports internal errors with AREPL backend to help diagnose bugs.

### Fixed:
Exception stacktrace used to include internal AREPL stacktrace - now the stacktrace only shows info relative to your code (see [#51](https://github.com/Almenon/AREPL-vscode/issues/51))

---

## v8

Fixed too many prints slowing or freezing the preview.  See [#37](https://github.com/Almenon/AREPL-vscode/issues/37)

## v7

Fixing case issue causing error in linux systems

## v6

see https://github.com/Almenon/AREPL-vscode/milestone/6?closed=1

Fixed #47 new arepl session command fails when user does not have doc open

Implemented #33 footer bar with feedback links

## v5:

see https://github.com/Almenon/AREPL-vscode/milestone/5

### Added:
* Setting to skip landing page
* Setting for print results at top
* Command to execute highlighted code in AREPL
* command for creating new file
* allow user to customize pythonPath and pythonOptions
* allow user to execute on save

## Fixed:
* timing is not sticky
