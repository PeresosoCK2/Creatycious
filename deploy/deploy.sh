#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/opt/creatycios"
cd "$PROJECT_DIR"

echo "=== Pulling latest code ==="
if ! git pull; then
  echo "ERROR: git pull failed. Check branch state and remote access."
  exit 1
fi

echo "=== Pulling latest images ==="
if ! docker compose pull; then
  echo "ERROR: docker compose pull failed. Check registry credentials and network."
  exit 1
fi

echo "=== Starting services ==="
docker compose up -d --remove-orphans --build

echo "=== Reloading nginx ==="
if ! docker compose exec -T nginx nginx -s reload; then
  echo "WARNING: nginx reload failed. Check nginx config with 'docker compose exec nginx nginx -t'."
fi

echo "Deploy complete."
