#!/bin/bash

set -e

echo "=========================================="
echo "News Portal - First Deployment"
echo "=========================================="

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Проверка наличия Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Создание директории проекта
sudo mkdir -p /opt/news-portal
sudo chown -R $USER:$USER /opt/news-portal

# Копирование файлов
cp docker-compose.vps.yml /opt/news-portal/docker-compose.yml
cp .env.example /opt/news-portal/.env

echo ""
echo "✅ Deployment files prepared!"
echo ""
echo "Next steps:"
echo "1. Edit /opt/news-portal/.env with your settings"
echo "2. Run: cd /opt/news-portal && docker-compose up -d"