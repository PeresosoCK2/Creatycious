#!/usr/bin/env bash
set -e
PROJECT_DIR="/opt/creatycios"
cd $PROJECT_DIR
git pull || true
docker compose pull || true
docker compose up -d --remove-orphans --build
docker compose exec -T nginx nginx -s reload || true
echo "Deploy complete."
