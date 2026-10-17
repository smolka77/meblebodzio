#!/bin/bash
# Rozpakowuje /root/sofelio.tar.gz, zachowuje data/, buduje i startuje.
set -euo pipefail

APP=/var/www/sofelio
TAR=/root/sofelio.tar.gz

if [[ ! -f "$TAR" ]]; then
  echo "Brak $TAR"
  exit 1
fi

pm2 stop sofelio >/dev/null 2>&1 || true
pm2 delete sofelio >/dev/null 2>&1 || true

mkdir -p "$APP"
tar -xzf "$TAR" -C "$APP"

find "$APP/deploy" -type f -exec sed -i 's/\r$//' {} +
chmod +x "$APP/deploy"/*.sh
bash "$APP/deploy/install.sh"
