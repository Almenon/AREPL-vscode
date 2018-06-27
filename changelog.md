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
