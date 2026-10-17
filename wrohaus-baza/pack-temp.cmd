@echo off
setlocal
cd /d "%~dp0"

set TAR=%TEMP%\sofelio.tar.gz
set STAGE=%TEMP%\sofelio-pakiet

echo [1/2] Zbieram pliki...
if exist "%STAGE%" rmdir /s /q "%STAGE%"
mkdir "%STAGE%"
mkdir "%STAGE%\src"
mkdir "%STAGE%\public"
mkdir "%STAGE%\deploy"

xcopy /E /I /Q /Y "src" "%STAGE%\src\" >nul
xcopy /E /I /Q /Y "public" "%STAGE%\public\" >nul
xcopy /E /I /Q /Y "deploy" "%STAGE%\deploy\" >nul
if exist "%STAGE%\public\uploads" rmdir /s /q "%STAGE%\public\uploads"

copy /Y "package.json" "%STAGE%\" >nul
copy /Y "package-lock.json" "%STAGE%\" >nul
copy /Y "next.config.ts" "%STAGE%\" >nul
copy /Y "tsconfig.json" "%STAGE%\" >nul
copy /Y "postcss.config.mjs" "%STAGE%\" >nul
copy /Y "eslint.config.mjs" "%STAGE%\" >nul
copy /Y "next-env.d.ts" "%STAGE%\" >nul

echo [2/2] Pakuje archiwum...
if exist "%TAR%" del /f /q "%TAR%"
tar.exe -czf "%TAR%" -C "%STAGE%" .
if errorlevel 1 (
  echo PACK_FAIL
  exit /b 1
)

echo PACK_OK
dir "%TAR%"
endlocal
