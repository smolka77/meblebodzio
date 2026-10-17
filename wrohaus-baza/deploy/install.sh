#!/bin/bash
# Pelna instalacja SOFELIO na VPS po rozpakowaniu paczki.
set -euo pipefail

APP=/var/www/sofelio
export DEBIAN_FRONTEND=noninteractive

wait_for_apt() {
  local i=0
  while true; do
    if ! fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1 \
      && ! fuser /var/lib/apt/lists/lock >/dev/null 2>&1 \
      && ! fuser /var/lib/dpkg/lock >/dev/null 2>&1; then
      return 0
    fi
    i=$((i + 1))
    if (( i > 40 )); then
      echo "apt nadal zablokowany."
      return 1
    fi
    echo "Czekam az zwolni sie apt ($i/40)..."
    sleep 3
  done
}

apt_do() {
  local n=0
  until apt-get -o DPkg::Lock::Timeout=120 "$@"; do
    n=$((n + 1))
    if (( n >= 6 )); then
      return 1
    fi
    echo "apt zajety, ponawiam za 10s ($n/6)..."
    sleep 10
  done
}

if [[ ! -f "$APP/package.json" ]]; then
  echo "Brak $APP/package.json — najpierw rozpakuj paczke."
  exit 1
fi

echo "============================================"
echo "  SOFELIO — instalacja / reset na VPS"
echo "============================================"

wait_for_apt || true
apt_do update -y
apt_do install -y curl git nginx unzip tar ca-certificates gnupg

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt_do install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

systemctl stop apache2 httpd 2>/dev/null || true
systemctl disable apache2 httpd 2>/dev/null || true

if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  ufw --force enable || true
fi

if command -v firewall-cmd >/dev/null 2>&1; then
  firewall-cmd --permanent --add-service=ssh || true
  firewall-cmd --permanent --add-service=http || true
  firewall-cmd --permanent --add-service=https || true
  firewall-cmd --reload || true
fi

find "$APP/deploy" -type f -exec sed -i 's/\r$//' {} +
chmod +x "$APP/deploy"/*.sh 2>/dev/null || true

echo ""
echo "[1/6] npm install (z Tailwind i reszta do builda)..."
cd "$APP"
# Stare statyczne OG/ikony Sofelio zostawaly po tarze — Discord bral tamto logo.
echo "Czyszcze leftover Sofelio OG/favicon..."
find "$APP/src/app" -type f \( \
  -name 'opengraph-image.png' -o \
  -name 'opengraph-image.jpg' -o \
  -name 'opengraph-image.jpeg' -o \
  -name 'opengraph-image.gif' -o \
  -name 'opengraph-image.webp' -o \
  -name 'twitter-image.png' -o \
  -name 'twitter-image.jpg' -o \
  -name 'twitter-image.jpeg' -o \
  -name 'twitter-image.gif' -o \
  -name 'twitter-image.webp' -o \
  -name 'icon.png' -o \
  -name 'icon.jpg' -o \
  -name 'icon.ico' -o \
  -name 'apple-icon.png' -o \
  -name 'apple-icon.jpg' -o \
  -name 'favicon.ico' \
\) -print -delete
rm -rf "$APP/.next" "$APP/node_modules" "$APP/node_modules/.cache" /root/.cache/next-webpack /tmp/next-*
if [[ -f "$APP/package-lock.json" ]]; then
  npm ci --include=dev
else
  npm install
fi

echo ""
echo "[2/6] npm run build..."
NODE_ENV=production npm run build

if [[ ! -f "$APP/.next/BUILD_ID" ]]; then
  echo "BLAD: build nie powiodl sie."
  exit 1
fi
echo "Build ID: $(cat "$APP/.next/BUILD_ID")"

echo ""
echo "[3/6] Katalogi danych..."
mkdir -p \
  "$APP/data/store" \
  "$APP/data/private/sessions" \
  "$APP/data/private/customer-sessions" \
  "$APP/data/uploads/chat" \
  "$APP/data/uploads/products" \
  "$APP/data/uploads/blog" \
  "$APP/data/uploads/fabrics"
chmod -R 750 "$APP/data" 2>/dev/null || true
chmod 700 "$APP/data/private" 2>/dev/null || true
chmod 600 "$APP/data/private/auth.env" 2>/dev/null || true
chmod 600 "$APP/data/private/sms.env" 2>/dev/null || true
chmod 600 "$APP/data/private/smtp.env" 2>/dev/null || true
chmod 600 "$APP/data/store/.session-secret" 2>/dev/null || true

ENV_FILE="$APP/.env"
touch "$ENV_FILE"
set_env() {
  local key="$1"
  local val="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$ENV_FILE"
  else
    printf '%s=%s\n' "$key" "$val" >> "$ENV_FILE"
  fi
}
set_env SITE_URL "https://wrohaus.pl"
set_env NEXT_PUBLIC_SITE_URL "https://wrohaus.pl"
set_env PAYU_ENV "production"

if grep -qE '^PAYU_POS_ID=.+' "$ENV_FILE" && grep -qE '^PAYU_CLIENT_SECRET=.+' "$ENV_FILE" && grep -qE '^PAYU_SECOND_KEY=.+' "$ENV_FILE"; then
  echo "PayU: klucze sa na serwerze. W panelu PayU ustaw sklep i notify na wrohaus.pl."
else
  echo "UWAGA: brak kluczy PayU w .env — sam panel PayU ich tu nie wgra."
fi

set_env SMS_NOTIFY_TO "48660591361"
if grep -qE '^SMSAPI_TOKEN=.+' "$ENV_FILE" 2>/dev/null \
  || grep -qE '^SMSAPI_TOKEN=.+' "$APP/data/private/sms.env" 2>/dev/null; then
  echo "SMS: token obecny — powiadomienia o zamowieniach na 660591361."
else
  echo "UWAGA: brak tokenu SMSAPI — SMS o zamowieniach nie wyjdzie. Wklej token w Admin / Ustawienia."
fi
if grep -qE '^SMTP_HOST=.+' "$ENV_FILE" 2>/dev/null \
  || grep -qE '^SMTP_HOST=.+' "$APP/data/private/smtp.env" 2>/dev/null; then
  echo "Poczta: SMTP obecny — potwierdzenia mailowe do klienta."
else
  echo "UWAGA: brak SMTP — mail do klienta nie wyjdzie. Wpisz dane skrzynki w Admin / Ustawienia."
fi

echo ""
echo "[4/6] Start PM2..."
export NODE_ENV=production
pm2 delete sofelio 2>/dev/null || true
pm2 start "$APP/node_modules/next/dist/bin/next" \
  --name sofelio \
  --cwd "$APP" \
  --update-env \
  -- start --hostname 127.0.0.1 --port 3000
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

ok=0
for i in $(seq 1 40); do
  if curl -sf -o /dev/null -I http://127.0.0.1:3000/; then
    ok=1
    break
  fi
  sleep 1
done

if [[ "$ok" != "1" ]]; then
  echo "Next.js nie odpowiada na 3000."
  pm2 logs sofelio --lines 80 --nostream || true
  exit 1
fi
echo "OK: aplikacja dziala na porcie 3000"

chmod +x "$APP/deploy/ssl.sh" 2>/dev/null || true
bash "$APP/deploy/ssl.sh"

echo ""
echo "============================================"
echo "  GOTOWE"
echo "============================================"
echo "Sklep:  https://wrohaus.pl"
echo "Stara:  https://wrohaus.com  (przekierowanie)"
echo "IP:     http://185.235.69.239"
echo "Admin:  https://wrohaus.pl/admin/login"
echo ""
pm2 status
