#!/usr/bin/env bash
set -e
PROJECT_DIR="/opt/creatycios"
DOMAIN="creatycios.com"
EMAIL="admin@$DOMAIN"
apt update -y
apt upgrade -y
if ! command -v docker >/dev/null 2>&1; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker $SUDO_USER || true
fi
if ! command -v docker compose >/dev/null 2>&1; then
  apt install -y docker-compose-plugin
fi
ufw allow OpenSSH || true
ufw allow 80 || true
ufw allow 443 || true
ufw --force enable || true
mkdir -p $PROJECT_DIR/deploy/nginx/conf.d
mkdir -p $PROJECT_DIR/deploy/nginx/certs
mkdir -p /var/www/certbot
chown -R $SUDO_USER:$SUDO_USER /var/www/certbot
if ! command -v certbot >/dev/null 2>&1; then
  apt install -y certbot
fi
certbot certonly --webroot -w /var/www/certbot -d $DOMAIN -d www.$DOMAIN || true
echo ""
echo "Servidor preparado. Copia archivos del repo a $PROJECT_DIR y ejecuta:"
echo "docker compose -f docker-compose.prod.yml up -d --build"
