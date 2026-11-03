@echo off
setlocal EnableExtensions
REM ============================================================
REM  Otwiera sklep lokalnie: http://localhost:3000
REM   1. dociaga zmiany z przebudowy sklepu, jesli ich jeszcze nie ma
REM   2. instaluje zaleznosci, jesli brakuje
REM   3. uruchamia serwer deweloperski i otwiera przegladarke
REM  Parametr /bezprzegladarki - nie otwiera przegladarki (do testow).
REM ============================================================

set "BRANCH=przebudowa-sklepu-2026-11"
set "URL=http://localhost:3000"
set "PROJECT=%~dp0"
if not exist "%PROJECT%package.json" set "PROJECT=C:\Users\48661\meblebodzio\"
cd /d "%PROJECT%" || (echo Nie mozna wejsc do folderu projektu & pause & exit /b 1)
title Sklep - lokalnie

where node >nul 2>&1 || (echo Nie znaleziono Node.js - zainstaluj go z https://nodejs.org & pause & exit /b 1)

REM --- 1. Zmiany sklepu ---------------------------------------
echo [1/3] Zmiany sklepu - galaz %BRANCH%
where git >nul 2>&1
if errorlevel 1 goto :po_git
if not exist ".git" goto :po_git

set "CURRENT="
for /f "delims=" %%b in ('git branch --show-current 2^>nul') do set "CURRENT=%%b"

git fetch origin %BRANCH% >nul 2>&1
if errorlevel 1 (
  echo       Brak polaczenia z GitHubem - uzywam tego, co jest na dysku.
  goto :po_git
)

if /i "%CURRENT%"=="%BRANCH%" (
  git pull --ff-only origin %BRANCH% >nul 2>&1 && echo       Galaz jest aktualna. || echo       Nie udalo sie zaktualizowac - zostaje wersja z dysku.
  goto :po_git
)

git merge-base --is-ancestor origin/%BRANCH% HEAD >nul 2>&1
if not errorlevel 1 (
  echo       Zmiany sa juz w galezi %CURRENT%.
  goto :po_git
)

git diff --quiet HEAD >nul 2>&1
if errorlevel 1 (
  echo       Masz niezapisane zmiany w galezi %CURRENT% - nie przelaczam galezi.
  goto :po_git
)

git checkout %BRANCH% >nul 2>&1 && echo       Przelaczono na galaz %BRANCH%. || echo       Nie udalo sie przelaczyc galezi - zostaje %CURRENT%.
:po_git

REM --- 2. Zaleznosci ------------------------------------------
if exist "node_modules\next\package.json" (
  echo [2/3] Zaleznosci sa zainstalowane.
) else (
  echo [2/3] Instaluje zaleznosci - to potrwa chwile...
  call npm install || (echo Instalacja nie powiodla sie. & pause & exit /b 1)
)

REM --- 3. Serwer ----------------------------------------------
echo [3/3] Serwer lokalny
call :czy_dziala
if not errorlevel 1 (
  echo       Serwer juz dziala.
  goto :otworz
)

echo       Uruchamiam serwer w osobnym oknie - zamknij je, aby zatrzymac sklep.
start "Sklep - serwer (zamknij okno, aby zatrzymac)" cmd /k npm run dev
echo       Czekam, az strona sie wczyta - pierwsze uruchomienie trwa kilkanascie sekund...
powershell -NoProfile -Command "for($i=0;$i -lt 120;$i++){try{Invoke-WebRequest -UseBasicParsing -Uri '%URL%' -TimeoutSec 20 | Out-Null; exit 0}catch{Start-Sleep -Seconds 1}}; exit 1"
if errorlevel 1 (
  echo       Serwer nie odpowiada - sprawdz okno serwera pod katem bledow.
  pause
  exit /b 1
)

:otworz
if /i "%~1"=="/bezprzegladarki" goto :koniec
echo Otwieram %URL% w przegladarce...
start "" "%URL%"

:koniec
endlocal
exit /b 0

:czy_dziala
powershell -NoProfile -Command "try{Invoke-WebRequest -UseBasicParsing -Uri '%URL%' -TimeoutSec 20 | Out-Null; exit 0}catch{exit 1}"
exit /b %errorlevel%
