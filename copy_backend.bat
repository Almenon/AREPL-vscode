setlocal

REM assumes "arepl-backend" is at ..\arepl-backend

set "source_dir=..\arepl-backend"
set "dest_dir=node_modules\arepl-backend"

if not exist "%dest_dir%" (
    mkdir "%dest_dir%"
)

REM Create exclude file temporarily
echo node_modules\ > exclude.txt
echo personal\ >> exclude.txt
echo .mypy_cache\ >> exclude.txt
echo .pytest_cache\ >> exclude.txt

xcopy "%source_dir%" "%dest_dir%" /E /I /EXCLUDE:exclude.txt

del exclude.txt

echo Copy complete.
endlocal
