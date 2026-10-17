@echo off
setlocal
cd /d "%~dp0"

set IP=185.235.69.239

echo [1/2] Wysylam poprawiony install.sh i ssl.sh.
echo Haslo root.
echo.

scp.exe -O -P 22 "deploy\install.sh" root@%IP%:/root/sofelio-install.sh
if errorlevel 1 (
  echo scp nie przeszedl, probuje drugi sposob...
  ssh.exe -p 22 root@%IP% "cat > /root/sofelio-install.sh" < "deploy\install.sh"
)
scp.exe -O -P 22 "deploy\ssl.sh" "deploy\nginx-sofelio.conf" "deploy\nginx-ssl.conf" root@%IP%:/root/
if errorlevel 1 (
  echo Wysylka nie wyszla.
  exit /b 1
)

echo.
echo [2/2] Build i start. Znowu haslo. Czekaj 2-4 min az zobaczysz GOTOWE.
echo.
ssh.exe -p 22 -o ServerAliveInterval=30 root@%IP% "mkdir -p /var/www/sofelio/deploy; tar -xzf /root/sofelio.tar.gz -C /var/www/sofelio; cp /root/sofelio-install.sh /var/www/sofelio/deploy/install.sh; cp /root/ssl.sh /var/www/sofelio/deploy/ssl.sh; cp /root/nginx-sofelio.conf /root/nginx-ssl.conf /var/www/sofelio/deploy/; find /var/www/sofelio/deploy -type f -exec sed -i 's/\r$//' {} +; chmod +x /var/www/sofelio/deploy/*.sh; bash /var/www/sofelio/deploy/install.sh"
if errorlevel 1 (
  echo Nie wyszlo. Zaloguj sie: ssh -p 22 root@%IP%
  exit /b 1
)

echo.
echo GOTOWE.
echo Sklep:  https://wrohaus.pl  /  http://%IP%/
echo Admin:  https://wrohaus.pl/admin/login
echo.
endlocal
