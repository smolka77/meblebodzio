#!/bin/bash
# Nginx + SSL. Nie wywala calej instalacji, gdy apt trzyma lock.
set -u

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
      echo "apt nadal zablokowany — pomijam instalacje certbota."
      return 1
    fi
    echo "Czekam az zwolni sie apt ($i/40)..."
    sleep 3
  done
}

apt_install() {
  local n=0
  until apt-get -o DPkg::Lock::Timeout=120 install -y "$@"; do
    n=$((n + 1))
    if (( n >= 5 )); then
      return 1
    fi
    echo "apt zajety, ponawiam za 10s ($n/5)..."
    sleep 10
  done
}

mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled /etc/nginx/snippets /var/www/html
: > /etc/nginx/snippets/legacy-sofelio-ssl.conf
: > /etc/nginx/snippets/legacy-wrohaus-com-ssl.conf

echo ""
echo "[Nginx HTTP]..."
cp "$APP/deploy/nginx-sofelio.conf" /etc/nginx/sites-available/sofelio
ln -sfn /etc/nginx/sites-available/sofelio /etc/nginx/sites-enabled/sofelio
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

echo ""
echo "[SSL]..."
if ! command -v certbot >/dev/null 2>&1; then
  wait_for_apt || true
  if ! apt_install certbot python3-certbot-nginx; then
    echo "Nie da sie doinstalowac certbota (apt lock). Certyfikat zostaje jak byl."
  fi
fi

CERT_PL=/etc/letsencrypt/live/wrohaus.pl/fullchain.pem
CERT_COM=/etc/letsencrypt/live/wrohaus.com/fullchain.pem
CERT_OLD=/etc/letsencrypt/live/sofelio.pl/fullchain.pem

if command -v certbot >/dev/null 2>&1; then
  if certbot certonly --webroot -w /var/www/html \
    -d wrohaus.pl -d www.wrohaus.pl \
    --non-interactive --agree-tos --keep-until-expiring \
    -m kontakt@sofelio.pl; then
    echo "SSL wrohaus.pl OK."
  else
    echo "Certbot nie wystawil certyfikatu dla wrohaus.pl. HTTP dalej dziala."
    echo "  certbot certonly --webroot -w /var/www/html -d wrohaus.pl -d www.wrohaus.pl"
  fi

  if [[ ! -f "$CERT_COM" ]]; then
    certbot certonly --webroot -w /var/www/html \
      -d wrohaus.com -d www.wrohaus.com \
      --non-interactive --agree-tos --keep-until-expiring \
      -m kontakt@sofelio.pl || true
  fi
fi

if [[ -f "$CERT_COM" ]]; then
  cat > /etc/nginx/snippets/legacy-wrohaus-com-ssl.conf <<'EOF'
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name wrohaus.com www.wrohaus.com;

    ssl_certificate /etc/letsencrypt/live/wrohaus.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wrohaus.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    return 308 https://wrohaus.pl$request_uri;
}
EOF
fi

if [[ -f "$CERT_OLD" ]]; then
  cat > /etc/nginx/snippets/legacy-sofelio-ssl.conf <<'EOF'
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name sofelio.pl www.sofelio.pl;

    ssl_certificate /etc/letsencrypt/live/sofelio.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sofelio.pl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    return 308 https://wrohaus.pl$request_uri;
}
EOF
fi

if [[ -f "$CERT_PL" ]]; then
  cp "$APP/deploy/nginx-ssl.conf" /etc/nginx/sites-available/sofelio
  nginx -t && systemctl reload nginx
  echo "SSL OK — sklep na https://wrohaus.pl"
else
  echo "Bez certyfikatu wrohaus.pl — sklep na HTTP."
fi

ENV_FILE="$APP/.env"
if [[ -f "$ENV_FILE" ]]; then
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
fi

exit 0
