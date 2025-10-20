#!/bin/bash

# Переходим в директорию strapi
cd apps/strapi

case "$1" in
    "up")
        echo "Запуск Strapi в Docker..."
        docker-compose -f ../../docker-compose.yml up strapi -d
        ;;
    "up-dev")
        echo "Запуск Strapi и MinIO в Docker..."
        docker-compose -f ../../docker-compose.yml up strapi minio -d
        ;;
    "down")
        echo "Остановка Strapi..."
        docker-compose -f ../../docker-compose.yml down
        ;;
    "logs")
        echo "Логи Strapi..."
        docker-compose -f ../../docker-compose.yml logs -f strapi
        ;;
    "build")
        echo "Сборка образа Strapi..."
        docker build -t orgma-strapi .
        ;;
    *)
        echo "Использование: $0 {up|up-dev|down|logs|build}"
        exit 1
        ;;
esac