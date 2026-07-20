#!/bin/bash
BACKUP_DIR=/opt/backups
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Создать бэкап
docker compose exec -T postgres pg_dump -U postgres news_portal | gzip > $BACKUP_DIR/news_portal_$TIMESTAMP.sql.gz

# Удалить бэкапы старше 30 дней
find $BACKUP_DIR -name "news_portal_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: news_portal_$TIMESTAMP.sql.gz"

# crontab -e
# 0 3 * * * /opt/news-portal/backup.sh >> /var/log/news-portal-backup.log 2>&1