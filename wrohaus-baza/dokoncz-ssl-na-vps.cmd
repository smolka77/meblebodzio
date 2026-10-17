@echo off
setlocal
cd /d "%~dp0"

set IP=185.235.69.239

echo Dokańczam tylko Nginx/SSL — bez przebudowy (sklep juz dziala).
echo Haslo root.
echo.

scp.exe -O -P 22 "deploy\ssl.sh" "deploy\nginx-sofelio.conf" "deploy\nginx-ssl.conf" root@%IP%:/root/
if errorlevel 1 (
  echo scp nie przeszedl, probuje drugi sposob...
  ssh.exe -p 22 root@%IP% "cat > /root/ssl.sh" < "deploy\ssl.sh"
  ssh.exe -p 22 root@%IP% "cat > /root/nginx-sofelio.conf" < "deploy\nginx-sofelio.conf"
  ssh.exe -p 22 root@%IP% "cat > /root/nginx-ssl.conf" < "deploy\nginx-ssl.conf"
)
if errorlevel 1 (
  echo Wysylka nie wyszla.
  exit /b 1
)

echo.
ssh.exe -p 22 -o ServerAliveInterval=30 root@%IP% "mkdir -p /var/www/sofelio/deploy; cp /root/ssl.sh /root/nginx-sofelio.conf /root/nginx-ssl.conf /var/www/sofelio/deploy/; sed -i 's/\r$//' /var/www/sofelio/deploy/ssl.sh; chmod +x /var/www/sofelio/deploy/ssl.sh; bash /var/www/sofelio/deploy/ssl.sh; echo GOTOWE"
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
