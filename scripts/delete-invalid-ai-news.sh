#!/usr/bin/env bash
# Удаление AI-новостей с отказом рерайта (ошибочные материалы вместо текста).
#
# Запуск на VPS (из корня репозитория, обычно /opt/news-portal):
#   chmod +x scripts/delete-invalid-ai-news.sh
#   ./scripts/delete-invalid-ai-news.sh              # dry-run: только список
#   ./scripts/delete-invalid-ai-news.sh --apply      # удаление из БД
#
# Требования: docker compose, контейнер postgres запущен, .env с DB_* (опционально).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

MODE="dry-run"
if [[ "${1:-}" == "--apply" ]]; then
  MODE="apply"
elif [[ -n "${1:-}" ]]; then
  echo "Usage: $0 [--dry-run|--apply]"
  echo "  --dry-run  (default) show matching news, no changes"
  echo "  --apply    delete matching news + related likes/favorites"
  exit 1
fi

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

DB_USERNAME="${DB_USERNAME:-postgres}"
DB_DATABASE="${DB_DATABASE:-news_portal}"
COMPOSE=(docker compose)

if ! "${COMPOSE[@]}" exec -T postgres pg_isready -U "$DB_USERNAME" -d "$DB_DATABASE" >/dev/null 2>&1; then
  echo "Error: postgres is not ready. Start stack first:"
  echo "  docker compose up -d postgres"
  exit 1
fi

run_psql() {
  local sql_file="$1"
  "${COMPOSE[@]}" exec -T postgres psql -v ON_ERROR_STOP=1 -U "$DB_USERNAME" -d "$DB_DATABASE" -f - <"$sql_file"
}

echo "Project: $PROJECT_DIR"
echo "Database: $DB_DATABASE (user: $DB_USERNAME)"
echo "Mode: $MODE"
echo

if [[ "$MODE" == "dry-run" ]]; then
  echo "=== Preview (no changes) ==="
  run_psql "$SCRIPT_DIR/delete-invalid-ai-news.preview.sql"
  echo
  echo "To delete listed rows, run:"
  echo "  $0 --apply"
  exit 0
fi

echo "=== APPLY: deleting invalid AI news ==="
read -r -p "Type DELETE to confirm: " confirm
if [[ "$confirm" != "DELETE" ]]; then
  echo "Aborted."
  exit 1
fi

run_psql "$SCRIPT_DIR/delete-invalid-ai-news.apply.sql"
echo "Finished."
