#!/bin/bash
# Stary skrypt — teraz robi to samo co install.sh
set -euo pipefail
APP=/var/www/sofelio
find "$APP/deploy" -type f -exec sed -i 's/\r$//' {} +
chmod +x "$APP/deploy/install.sh"
bash "$APP/deploy/install.sh"
