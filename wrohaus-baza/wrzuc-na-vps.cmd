@echo off
setlocal
cd /d "%~dp0"

set IP=185.235.69.239
set TAR=%TEMP%\sofelio.tar.gz
set STAGE=%TEMP%\sofelio-pakiet

echo [1/4] Zbieram pliki...
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

echo [2/4] Pakuje archiwum...
if exist "%TAR%" del /f /q "%TAR%"
tar.exe -czf "%TAR%" -C "%STAGE%" .
if errorlevel 1 (
  echo Nie udalo sie zrobic tar. Czy masz Windows 10/11 z tar.exe?
  exit /b 1
)

echo [3/4] Wysylam na VPS. Jak zapyta o haslo ??? wpisz haslo root.
echo.
scp.exe -O -P 22 "%TAR%" root@%IP%:/root/sofelio.tar.gz
if errorlevel 1 (
  echo scp nie przeszedl, probuje drugi sposob...
  ssh.exe -p 22 root@%IP% "cat > /root/sofelio.tar.gz" < "%TAR%"
)
if errorlevel 1 (
  echo Wysylka nie wyszla. Sprawdz IP, port 22 i haslo.
  exit /b 1
)

echo.
echo [4/4] Reset + build + start na VPS. Znowu haslo root. Czekaj 2-4 min.
echo.
ssh.exe -p 22 -o ServerAliveInterval=30 root@%IP% "mkdir -p /var/www/sofelio; tar -xzf /root/sofelio.tar.gz -C /var/www/sofelio; find /var/www/sofelio/deploy -type f -exec sed -i 's/\r$//' {} +; chmod +x /var/www/sofelio/deploy/*.sh; bash /var/www/sofelio/deploy/install.sh"
if errorlevel 1 (
  echo Instalacja na VPS nie wyszla. Zaloguj sie: ssh -p 22 root@%IP%
  exit /b 1
)

echo.
echo GOTOWE.
echo Sklep:  https://wrohaus.pl  /  http://%IP%/
echo Admin:  https://wrohaus.pl/admin/login
echo.
echo TERAZ DRUGA KOMENDA (logowanie panelu):
echo wrzuc-auth-na-vps.cmd
echo.
endlocal
