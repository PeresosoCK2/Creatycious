#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/opt/creatycios"
DOMAIN="creatycios.com"
EMAIL="admin@$DOMAIN"

echo "=== Updating server ==="
apt update -y
apt upgrade -y

if ! command -v docker >/dev/null 2>&1; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker "${SUDO_USER:-}" || echo "Warning: could not add user to docker group"
fi

if ! command -v docker compose >/dev/null 2>&1; then
  echo "Installing docker compose plugin..."
  apt install -y docker-compose-plugin
fi

echo "=== Configuring firewall ==="
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

echo "=== Creating project directories ==="
mkdir -p "$PROJECT_DIR/deploy/nginx/conf.d"
mkdir -p "$PROJECT_DIR/deploy/nginx/certs"
mkdir -p /var/www/certbot
chown -R "${SUDO_USER:-root}:${SUDO_USER:-root}" /var/www/certbot

if ! command -v certbot >/dev/null 2>&1; then
  echo "Installing certbot..."
  apt install -y certbot
fi

echo "=== Obtaining SSL certificates ==="
if ! certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive; then
  echo "ERROR: Failed to obtain SSL certificates for $DOMAIN."
  echo "Ensure DNS is configured and ports 80/443 are accessible."
  exit 1
fi

echo ""
echo "Server ready. Copy repo files to $PROJECT_DIR and run:"
echo "docker compose -f docker-compose.prod.yml up -d --build"
