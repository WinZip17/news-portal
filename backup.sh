#!/bin/bash
# Резервная копия PostgreSQL из Docker Compose.
# Cron (от root или пользователя с доступом к docker):
#   chmod +x /opt/news-portal/backup.sh
#   crontab -e
#   0 3 * * * /opt/news-portal/backup.sh >> /var/log/news-portal-backup.log 2>&1

set -euo pipefail

PROJECT_DIR=/opt/news-portal
BACKUP_DIR=/opt/backups
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_USER=postgres
DB_NAME=news_portal

mkdir -p "$BACKUP_DIR"
cd "$PROJECT_DIR" || {
  echo "[$(date -Is)] ERROR: project dir not found: $PROJECT_DIR" >&2
  exit 1
}

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
  DB_USER="${DB_USERNAME:-postgres}"
  DB_NAME="${DB_DATABASE:-news_portal}"
fi

if ! docker compose ps --status running postgres | grep -q postgres; then
  echo "[$(date -Is)] ERROR: postgres container is not running" >&2
  exit 1
fi

BACKUP_FILE="$BACKUP_DIR/news_portal_${TIMESTAMP}.sql.gz"
docker compose exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

find "$BACKUP_DIR" -name 'news_portal_*.sql.gz' -mtime +"$RETENTION_DAYS" -delete

echo "[$(date -Is)] Backup completed: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
