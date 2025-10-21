# 🚀 Локальный MinIO с Docker

## 1. Установка Docker

- Скачай и установи **Docker Desktop**:  
  [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
- Проверь установку:
```bash
docker --version
docker compose version
```

version: '3.8'

services:
minio:
image: minio/minio:RELEASE.2025-04-22T22-12-26Z
container_name: minio
restart: always
ports:
- "9000:9000"   # API
- "9001:9001"   # Веб-консоль
environment:
- MINIO_ROOT_USER=admin
- MINIO_ROOT_PASSWORD=admin123
volumes:
- ./data:/data
command: server /data --console-address ":9001"



**# Запуск MinIO в фоне
docker compose up -d

# Проверка запущенных контейнеров
docker ps

# Остановка контейнера
docker compose down
**

4. Доступ к MinIO

Веб-консоль: http://localhost:9001

Логин: admin
Пароль: admin123

API MinIO (S3 совместимо): http://localhost:9000

5. Создание Bucket

Перейди в веб-консоль: http://localhost:9001

Авторизуйся (admin/admin123)

Нажми Create Bucket

Назови bucket, например uploads

6. Работа с MinIO через CLI (mc)
   Установка MinIO Client

Скачай и установи mc:
https://min.io/docs/minio/linux/reference/minio-mc.html

Настройка клиента:
# Добавляем алиас для локального MinIO
mc alias set local http://localhost:9000 admin admin123

# Проверяем алиасы
mc alias list

Основные команды:
# Список bucket'ов
mc ls local

# Создать bucket
mc mb local/uploads

# Загрузить файл
mc cp ./example.png local/uploads

# Скачать файл
mc cp local/uploads/example.png ./downloaded.png

# Удалить файл
mc rm local/uploads/example.png

7. Использование MinIO в Strapi

MinIO полностью совместим с S3 API, поэтому для Strapi используем плагин strapi-provider-upload-s3.

Пример .env для Strapi:

AWS_ACCESS_KEY_ID=admin
AWS_SECRET_ACCESS_KEY=admin123
AWS_REGION=us-east-1
AWS_BUCKET=uploads
AWS_ENDPOINT=http://localhost:9000
AWS_FORCE_PATH_STYLE=true

8. Основные команды MinIO
   Команда	Описание
   docker compose up -d	Запуск MinIO
   docker compose down	Остановка MinIO
   docker ps	Список контейнеров
   mc alias set	Настройка MinIO Client
   mc ls	Просмотр bucket'ов/файлов
   mc mb	Создание нового bucket
   mc cp	Загрузка/скачивание файлов
   mc rm	Удаление файлов