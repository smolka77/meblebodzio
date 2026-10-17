#!/bin/bash
# Aktualizacja kodu z /root/sofelio-deploy.zip (zachowuje data/store i uploads)
set -e

ZIP="/root/sofelio-deploy.zip"
APP="/var/www/sofelio"

if [ ! -f "$ZIP" ]; then
  echo "Brak pliku $ZIP — najpierw wgraj paczkę z Windows."
  exit 1
fi

echo "=== SOFELIO — aktualizacja z ZIP ==="

mkdir -p "$APP"
cd "$APP"

if [ -d data/store ]; then
  echo "Backup data/store..."
  tar -czf "/root/sofelio-store-backup-$(date +%Y%m%d-%H%M).tar.gz" data/store 2>/dev/null || true
fi

echo "Rozpakowywanie..."
unzip -o "$ZIP" -d "$APP"

bash "$APP/deploy/full-update.sh"
